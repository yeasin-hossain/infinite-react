export function inferSection(
  pathname: string
): 'learn' | 'reference' | 'home' {
  let [_, docs, v, sectionName] = pathname.split('/');

  //todo continue here
  console.log({ sectionName, v, docs, _ });
  if (docs === '404') {
    return 'learn';
  }
  if (sectionName === 'learn') {
    return 'learn';
  } else if (sectionName === 'reference') {
    return 'reference';
  } else {
    return 'home';
  }
}
