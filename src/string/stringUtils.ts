export function formatCamelStr(str = ''): string {
    return str.replace(/^\w/, c => c.toUpperCase()).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
}

export function replaceAll(text: string, searchValue: string, replaceValue = ''): string {
    return text.replace(new RegExp(searchValue, 'g'), replaceValue || '');
}
