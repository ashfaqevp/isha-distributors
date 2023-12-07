import { storeToRefs } from 'pinia'
import moment from 'moment'

export function useUtils() {
  const date = moment()
  const today = date.format('YYYY-MM-DD')

  const currentTime = new Date()

  const productCategories = ['Milk Products', 'Curd & Sambaram', 'Ghee & Butter', 'Ice Creams', 'Sweet & Drinks', 'Others']
  const shopCategories = ['normal', 'discount', 'special', 'dealer']

  function formatAsCurrency(input: any) {
    const amount = Number.parseFloat(input).toFixed(2)
    const formattedAmount = `₹ ${amount}/-`
    return formattedAmount
  }

  function formatColor(input) {
    switch (input) {
      case 'normal' :
        return '#1BAFD0'

      case 'discount':
        return '#6967CE'

      case 'special' :
        return '#FFB900'

      case 'dealer':
        return '#FD636B'

      default:
        return '#9AA0A6'
    }
  }

  function formatAvatar(inputString) {
    const words = inputString.split(' ')
    const formattedWords = words.map((word) => {
      const firstTwoLetters = words.length === 1 ? word.slice(0, 2) : word.slice(0, 1)
      const capitalizedLetters = firstTwoLetters.toUpperCase()
      return capitalizedLetters
    })
    const formattedString = formattedWords.join('')
    return formattedString
  }

  const capitalize = (string: string) => {
    if (!string)
      return
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  return {
    productCategories,
    shopCategories,
    today,
    currentTime,
    formatAvatar,
    formatColor,
    capitalize,
    formatAsCurrency,
  }
}
