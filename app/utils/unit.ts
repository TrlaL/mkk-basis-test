export type UnitSuffix = 'px' | 'em' | 'rem' | 'vh' | 'vw' | '%'

export function unit(value: number | string, suffix: UnitSuffix = 'px'): string {
  return typeof value === 'number' ? `${value}${suffix}` : value
}
