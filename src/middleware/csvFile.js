export async function csvFile(req, res) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const fullStreamContent = Buffer.concat(buffers).toString();

  const startIndex = fullStreamContent.indexOf('title,description');

  if (startIndex !== -1) {
    const csvContent = fullStreamContent.slice(startIndex);

    const boundaryRegex = /--\w+-BOUNDARY--/;
    const cleanCsvContent = csvContent.split(boundaryRegex)[0].trim();

    const csvArray = cleanCsvContent
      .split('\n')
      .filter((line) => line.trim() !== '');

    csvArray.pop();

    return csvArray;
  }

  return null;
}
