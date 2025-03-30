export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月は0から始まるため+1
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0'); // 2桁にする
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 2桁にする

    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}