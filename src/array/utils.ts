export function sort(array: any[], ...fields: string[]) {
  const sortFields = fields.map(field => {
    const asc = !field.endsWith(' DESC');
    return {
      asc,
      field: field.replace(asc ? /\sASC$/ : /\sDESC$/, '')
    }
  });

  array.sort(comparator(sortFields));
  return array;
}

function comparator(sortFields: any[]) {
  return (a: any, b: any) => {
    for(let i = 0, len = sortFields.length; i < len; i++) {
      const res = compare(a, b, sortFields[i]);

      if (res !== 0) {
        return res;
      }
    }
    return 0;
  }
}

function compare(a: any, b: any, {field, asc}: any): number {
  const valA = a[field];
  const valB = b[field];
  const koef = asc ? 1 : -1;
  if (valA > valB) {
    return 1 * koef;
  }


  if (valA < valB) {
    return -1 * koef;
  }

  return 0;
}
