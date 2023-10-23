/*
materials:
  https://codesandbox.io/s/exceljs-export-react-forked-gnogg?file=/App.js:2887-2893
  https://zetcode.com/javascript/exceljs/
  https://www.codeproject.com/Tips/1251189/Excel-Export-from-Angular-2plus
  https://github.com/exceljs/exceljs
*/

import Excel from 'exceljs';
import saveAs from 'file-saver';
import { URLObjectProps } from './calcThematicityIndex';

export interface FileExcelProperties {
  urlColumnIndex: number;
  thematicityColumnIndex: number;
  totalPageColumnIndex?: number;
  urlObjects: URLObjectProps[];
}

/**Used Static method to set object as value*/
class URLObject {
  static create(props: URLObjectProps) {
    return { url: props.url, totalPage: '', targetPage: '', thematicityIndex: '' };
  }
}

async function read(buffer: ArrayBuffer): Promise<FileExcelProperties | null> {
  const workbook = new Excel.Workbook();
  const urlObjects: URLObjectProps[] = [];

  let urlColumnIndex = 0;
  let thematicityColumnIndex = 0;
  let totalPageColumnIndex = 0;
  let urls: string[] = [];

  await workbook.xlsx
    .load(buffer)
    .then(() => {
      const worksheet = workbook.getWorksheet('Site Data');
      if (!worksheet) {
        alert(`Rename your worksheet(Excel tab) with list of urls to:\n\rSite Data`);
        return null;
      }

      const headerRow = worksheet.getRow(1);
      if (!headerRow) {
        alert(`First worksheet row must contain column headers`);
      }
      headerRow.eachCell((cell, colNumber) => {
        const value = cell.value?.toString().toLocaleLowerCase();
        if (value === 'site url') urlColumnIndex = colNumber;
        else if (value === 'thematicity index') thematicityColumnIndex = colNumber;
        else if (value === 'total page') totalPageColumnIndex = colNumber;
      });

      const urlColumn = worksheet.getColumn(urlColumnIndex);
      const rowsCount = urlColumn.values.slice(2).length; //in Excel 0 row is undefind, 1 is header with capture
      const rowsWithValues = worksheet.getRows(2, rowsCount);

      if (!rowsWithValues) {
        alert("You provide an empty file, provide urls as in example");
        return null;
      }
      for (const row of rowsWithValues) {
        const urlValue = row.getCell(urlColumnIndex);
        const totalPageValue = row.getCell(totalPageColumnIndex);

        let url: string = '';
        let totalPage: string = '';

        if (typeof urlValue === 'object' && urlValue !== null && 'hyperlink' in urlValue) {
          url = urlValue.hyperlink;
        } else {
          url = String(urlValue);
        }

        if (typeof totalPageValue.value === 'string' && isFinite(parseInt(totalPageValue.value))) {
          //Что насч'т разукрашенного фарматированного шрифтом числа? Єто обьект или просто число?
        }
      }
      // urls = urlColumn.values.map(value => {
      //   if (typeof value === 'object' && value !== null && 'hyperlink' in value) {
      //     return value.hyperlink;
      //   }
      //   return String(value);
      // });
      // urls.splice(0, 2); //in Excel 0 row is undefind, 1 is header with capture

      // for (const url of urls) {
      //   urlObjects.push(URLObject.create({ url }));
      // }
      

    })
    .catch(err => console.error(err));

  if (!urlColumnIndex) {
    alert(`Provide column with name: \n\rSite URL`);
    return null;
  }
  if (!thematicityColumnIndex) {
    alert(`Provide column with name: \n\rThematicity Index`);
    return null;
  }

  const fileExcelProperties = {
    urlColumnIndex,
    thematicityColumnIndex,
    totalPageColumnIndex,
    urlObjects,
  };

  return fileExcelProperties;
}

function createExample() {
  const fileName = 'example.xlsx';
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Site Data');
  const data = [
    ['Some info', 'Site URL', 'Some info', 'Thematicity Index', 'Some info', 'Total Page'],
    ['data', 'washingtonpost.com', 'data', 'will be filled', 'data', 'will be filled'],
    ['data', 'www.businessinsider.com/', 'data', 'will be filled', 'data', 'will be filled'],
    ['data', 'https://www.who.int/', 'data', 'will be filled', 'data', 'will be filled'],
    ['data', 'macobserver.com', 'data', 'will be filled', 'data', 'will be filled'],
  ];

  workbook.creator = 'ThematicityIndex';
  workbook.lastModifiedBy = 'ThematicityIndex';
  workbook.created = new Date();

  worksheet.addRows(data);
  worksheet.getRow(1).font = { bold: true };

  worksheet.getColumn(1).width = 10;
  worksheet.getColumn(1).alignment = { horizontal: 'center' };
  worksheet.getColumn(2).width = 25;
  worksheet.getColumn(2).alignment = { horizontal: 'center' };
  worksheet.getColumn(2).eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C6E0B4' },
    };
  });
  worksheet.getColumn(3).width = 10;
  worksheet.getColumn(3).alignment = { horizontal: 'center' };
  worksheet.getColumn(4).width = 17;
  worksheet.getColumn(4).alignment = { horizontal: 'center' };
  worksheet.getColumn(4).eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C6E0B4' },
    };
  });
  worksheet.getColumn(5).width = 10;
  worksheet.getColumn(5).alignment = { horizontal: 'center' };
  worksheet.getColumn(6).width = 12;
  worksheet.getColumn(6).eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C6E0B4' },
    };
  });
  worksheet.getColumn(6).alignment = { horizontal: 'center' };

  worksheet.getCell('B1').note = {
    texts: [{ font: { bold: true, size: 12, name: 'Calibri', family: 2 }, text: 'Require column' }],
  };
  worksheet.getCell('D1').note = {
    texts: [{ font: { bold: true, size: 12, name: 'Calibri', family: 2 }, text: 'Require column' }],
  };
  worksheet.getCell('F1').note = {
    texts: [
      { font: { bold: true, size: 11, name: 'Calibri', family: 2 }, text: 'Optional column' },
      {
        font: { size: 10, color: { theme: 1 }, name: 'Calibri' },
        text: '\n\rIf there is no column, it will not be filled',
      },
    ],
  };

  workbook.xlsx
    .writeBuffer()
    .then(buffer => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
    })
    .catch(err => {
      console.error(err.message);
    });
}

const fileExcel = {
  read,
  createExample,
};

export default fileExcel;
