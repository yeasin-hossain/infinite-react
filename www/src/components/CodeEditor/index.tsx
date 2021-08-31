import * as React from "react";

import * as InfiniteTable from "@infinite-table/infinite-react";

import { useMemo, useRef, useState } from "react";
import {
  editorWrapperClassName,
  editorWrapperFullScreen,
  errorClassName,
} from "./index.css";
import { compile } from "./compile";
import { Editor, highlight } from "./Editor";
import { CodeEditorHeader } from "./CodeEditorHeader";
import { spaceScale, vars } from "@www/styles/utils.css";

const debounce = require("debounce");
const dashify = require("dashify");

export type CodeEditorProps = {
  children: string;
  className?: string;
  render?: any;
  live?: string | boolean;
  height?: string;
  title?: string;
};

type CodePreviewProps = {
  transpiledCode: string;
};
const CodePreview = (props: CodePreviewProps) => {
  const renderFn = React.useMemo(() => {
    const fn = new Function(
      "require",
      "render",
      "exports",
      props.transpiledCode
    );

    return fn;
  }, [props.transpiledCode]);

  const [content, setContent] = useState<React.ReactNode>(null);

  React.useEffect(() => {
    const render = (el: React.ReactNode) => {
      setContent(el);
    };
    const require = (what: string) => {
      if (what === "@infinite-table/infinite-react") {
        return InfiniteTable;
      }
      if (what === "react") {
        return React;
      }
    };
    const exports = {};
    renderFn(require, render, exports);
  }, [renderFn]);

  return <>{content}</>;
};

type CodeError = {
  message: string;
  location: string;
};
function Errors({ errors }: { errors: CodeError[] }) {
  return (
    <div>
      {errors.map((err) => {
        return (
          <div
            className={errorClassName}
            key={`${err.message}-${err.location}`}
          >
            <div>{err.location}</div>
            <div>{err.message}</div>
          </div>
        );
      })}
    </div>
  );
}

export const CodeEditor = (props: CodeEditorProps) => {
  let { children, title = "example", live, height } = props;

  //@ts-ignore
  if (height && height == height * 1) {
    height = `${height}px`;
  }

  const [fileName] = useState(() => {
    return title ? dashify(title) + ".tsx" : "";
  });

  let [code, setCode] = useState(() => children.trim());

  const [errors, setErrors] = useState<CodeError[]>([]);

  const previewRef = useRef<JSX.Element>(null);
  const compiledCode = useRef("");

  const getPreview = (code: string) => {
    const { result, errors } = compile(code, fileName);

    let preview = previewRef.current;
    let updated: boolean = false;

    if (!errors.length) {
      if (result !== compiledCode.current) {
        preview = <CodePreview transpiledCode={result} />;
        updated = true;
        compiledCode.current = result;
      }
    }
    return {
      updated,
      preview,
      result,
      errors,
    };
  };

  const [preview, setPreview] = useState<JSX.Element | null>(() => {
    const { preview: thePreview, errors } = getPreview(code);

    if (errors.length && typeof window !== "undefined") {
      requestAnimationFrame(() => {
        setErrors(errors);
      });
    }

    return thePreview;
  });

  const onCodeChange = useMemo(() => {
    const transpile = debounce((code: string) => {
      requestAnimationFrame(() => {
        const { updated, preview, errors } = getPreview(code);

        if (updated) {
          setPreview(preview);
        }
        setErrors(errors);
      });
    }, 1500);

    return (code: string) => {
      setCode(code);
      transpile(code);
    };
  }, []);
  const [fullScreen, setFullScreen] = useState(false);

  if (fullScreen) {
    height = "100%";
  }

  React.useEffect(() => {
    document.documentElement.style.overflow = fullScreen ? "hidden" : "auto";
  }, [fullScreen]);

  const toggleFullScreen = () => setFullScreen(!fullScreen);

  const style: React.CSSProperties = fullScreen
    ? {
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: vars.color.white,
      }
    : {
        marginBottom: spaceScale[3],
      };

  const header = title ? (
    <CodeEditorHeader
      toggleFullScreen={toggleFullScreen}
      fullScreen={fullScreen && !!live}
      live={!!live}
      ts={true}
      hasError={live ? !!errors.length : false}
      title={props.title}
      clipboardCode={code}
    />
  ) : null;
  if (live) {
    const editor = (
      <Editor
        fullScreen={fullScreen}
        onCodeChange={onCodeChange}
        code={code}
        height={height}
      />
    );

    return (
      <div style={style}>
        {header}
        <div
          className={`${editorWrapperClassName} ${
            fullScreen ? editorWrapperFullScreen : ""
          }`}
        >
          <div style={{ minWidth: "50%", minHeight: height, height }}>
            {preview}
          </div>
          {editor}
        </div>
        <Errors errors={errors} />
      </div>
    );
  }

  return (
    <div style={style}>
      {header}
      {highlight(code)}
    </div>
  );
};
