// src/lib/utils.ts

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Tách các ký tự dấu (ví dụ: 'ệ' -> 'e' + '̣' + 'ˆ')
    .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu đó đi
    .toLowerCase()
    .replace(/\s+/g, '-')           // Thay thế khoảng trắng bằng '-'
    .replace(/đ/g, 'd')             // Thay chữ 'đ' thành 'd'
    .replace(/[^\w\-]+/g, '')       // Xóa các ký tự không phải chữ, số, hoặc '-'
    .replace(/\-\-+/g, '-')         // Thay thế nhiều '-' bằng một '-'
    .replace(/^-+/, '')             // Xóa '-' ở đầu chuỗi
    .replace(/-+$/, '');            // Xóa '-' ở cuối chuỗi
}