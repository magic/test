export const getFNS = (env = process.env) => {
  let { FN = '' } = env

  if (FN) {
    if (FN.includes(' ')) {
      return FN.split(/ ,;/).filter(a => a)
    }
  }

  return FN
}
