export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID').format(amount)
}

export function parseRupiah(formatted) {
  return parseFloat(formatted.replace(/\./g, ''))
}
