import { storeToRefs } from 'pinia'

export function useUtils() {
  const productCategories = ['Milk Products', 'Curd & Sambaram', 'Ghee & Butter', 'Ice Creams', 'Sweet & Drinks', 'Others']

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

    capitalize,
    formatAsCurrency,
  }
}
