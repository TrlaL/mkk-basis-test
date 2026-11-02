export type BemMods = Record<string, string | boolean | undefined>

export function bem(block: string) {
  return (elementOrMods?: string | BemMods, mods: BemMods = {}): string => {
    if (typeof elementOrMods === 'object') mods = elementOrMods
    const base = typeof elementOrMods === 'string' ? `${block}__${elementOrMods}` : block

    const classes = [base]
    for (const [key, value] of Object.entries(mods)) {
      if (value) classes.push(value === true ? `${base}--${key}` : `${base}--${key}-${value}`)
    }
    return classes.join(' ')
  }
}
