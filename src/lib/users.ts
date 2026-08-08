export const USER_NAMES = ['anh Lâm', 'em Bích']

export function userEmoji(name: string): string {
  return name === 'em Bích' ? '❤️' : '🌱'
}

export function userLabel(name: string): string {
  return name === 'em Bích' ? 'em Bích' : 'anh Lâm'
}
