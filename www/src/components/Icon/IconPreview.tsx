import * as React from 'react';

export const IconPreview = React.memo<JSX.IntrinsicElements['svg']>(
  function IconPreview({ className }) {
    return (
      <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        height="20"
        width="20"
      >
        <path d="M10 12.875Q11.125 12.875 12.083 12.323Q13.042 11.771 13.583 10.833Q13.042 9.896 12.083 9.344Q11.125 8.792 10 8.792Q8.875 8.792 7.917 9.344Q6.958 9.896 6.417 10.833Q6.958 11.771 7.917 12.323Q8.875 12.875 10 12.875ZM10 14.167Q8.292 14.167 6.948 13.24Q5.604 12.312 5 10.833Q5.604 9.354 6.948 8.427Q8.292 7.5 10 7.5Q11.708 7.5 13.052 8.427Q14.396 9.354 15 10.833Q14.396 12.312 13.052 13.24Q11.708 14.167 10 14.167ZM10 12.125Q9.458 12.125 9.083 11.75Q8.708 11.375 8.708 10.833Q8.708 10.292 9.083 9.917Q9.458 9.542 10 9.542Q10.542 9.542 10.917 9.917Q11.292 10.292 11.292 10.833Q11.292 11.375 10.917 11.75Q10.542 12.125 10 12.125ZM4.25 17.5Q3.521 17.5 3.01 16.99Q2.5 16.479 2.5 15.75V4.25Q2.5 3.521 3.01 3.01Q3.521 2.5 4.25 2.5H15.75Q16.479 2.5 16.99 3.01Q17.5 3.521 17.5 4.25V15.75Q17.5 16.479 16.99 16.99Q16.479 17.5 15.75 17.5ZM4.25 15.75H15.75Q15.75 15.75 15.75 15.75Q15.75 15.75 15.75 15.75V5.917H4.25V15.75Q4.25 15.75 4.25 15.75Q4.25 15.75 4.25 15.75Z" />
      </svg>
    );
  },
);

IconPreview.displayName = 'IconPreview';
