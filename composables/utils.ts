import { storeToRefs } from 'pinia'
import moment from 'moment'

export function useUtils() {
  const date = moment()
  const today = date.format('YYYY-MM-DD')

  const productCategories = ['Milk Products', 'Curd & Sambaram', 'Ghee & Butter', 'Ice Creams', 'Sweet & Drinks', 'Others']
  const shopCategories = ['normal', 'discount', 'special', 'dealer']

  function formatAsCurrency(input: any) {
    const amount = Number.parseFloat(input).toFixed(2)
    const formattedAmount = `₹ ${amount}/-`
    return formattedAmount
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

    capitalize,
    formatAsCurrency,
  }
}
