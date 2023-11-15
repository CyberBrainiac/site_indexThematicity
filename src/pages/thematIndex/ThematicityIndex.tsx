import React, { FormEvent, useState, useReducer, useEffect, useRef, useContext } from 'react';
import { ButtonCommon } from '@/components/buttons/Buttons';
import style from './thematicityIndex.module.scss';
import InputFile from '@/components/inputFile/InputFile';
import fileExcel from '@/pages/thematIndex/fileExcel';
import calcThematicityIndex from '@/pages/thematIndex/calcThematicityIndex';
import UnvalidValueError from '@/utils/errorHandlers/unvalidValueError';
import reducerExelData from './reducerExelData';
import locStorage from '@/utils/localStorage';
import { AuthContext } from '@/containers/AuthContext';
// import fireStore from '@/services/fireStore';

const ThematicityIndex: React.FC = () => {
  const { googleProfl, projProfl } = useContext(AuthContext);
  const [excelData, dispatchExcelData] = useReducer(reducerExelData, null);

  const [upLoadedFile, setUpLoadedFile] = useState<File | null>(null);
  const [fileBinaryData, setFileBinaryData] = useState<ArrayBuffer | null>(null);
  const [logProgress, setLogProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isToolRun, setToolRun] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const isUserUseTool = useRef(false);
  const userQuery = useRef('');
  const storageExcelKey = 'TI_userExcelData';
  const storageQueryKey = 'TI_userQuery';
  const pricePerRequest = 0.012;

  //
  useEffect(() => {
    if (!excelData) {
      const data = locStorage.get(storageExcelKey);
      let savedQuery = locStorage.get(storageQueryKey);

      if (!data) return;
      if (!savedQuery) savedQuery = { query: '' };

      dispatchExcelData({ type: 'SET', excelData: data });
      userQuery.current = savedQuery.query;
      return;
    }

    setToolRun(false);
    if (!isUserUseTool.current) return; // check 1 load, if data empty this is first load and not need to set data in storage
    locStorage.set(storageExcelKey, excelData);
    locStorage.set(storageQueryKey, { query: userQuery.current });
  }, [excelData]);

  //
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();

    //Create binary ArrayBuffer
    reader.onload = onReady => {
      const buffer = onReady.target?.result as ArrayBuffer;
      setFileBinaryData(buffer);
      readBuffer(buffer);
    };
    reader.onerror = error => {
      console.error('Error in File Reader', error);
    };

    if (!file) {
      alert("Please, provide Excel file with correct extension: 'example.xlsx'");
      return null;
    }

    setUpLoadedFile(file);
    reader.readAsArrayBuffer(file);
  };

  //
  const readBuffer = async (buffer: ArrayBuffer) => {
    const data = await fileExcel.read(buffer);

    if (!data) {
      console.error('Can not read buffer data');
      return null;
    }
    dispatchExcelData({ type: 'SET', excelData: data });
  };

  //Create new Excel file
  const handleLoadResult = async () => {
    if (!excelData) {
      alert('Upload your file.xlsx or use Example file');
      return null;
    }
    if (!fileBinaryData) {
      alert(
        'Upload Example.xlsx or similar file to load previous result index thematicity calculation'
      );
      return null;
    }

    if (!isUserUseTool.current) {
      fileExcel.write({
        file: fileBinaryData,
        excelData: locStorage.get(storageExcelKey),
        query: userQuery.current,
      });
      return;
    }

    fileExcel.write({
      file: fileBinaryData,
      excelData: excelData,
      query: userQuery.current,
    });
  };

  //
  const handleCreateExample = () => {
    fileExcel.createExample();
  };

  //
  const progressHandler = (value: string) => {
    setLogProgress(value);
  };

  //
  const errorHandler = (errorMessage: string) => {
    setErrorMessage(errorMessage);
  };

  //Calculate Thematicity Index
  const formHandler = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    let inputKeyword = formData.get('request');

    if (typeof inputKeyword !== 'string') {
      throw new UnvalidValueError("expected type for user inputKeyword is 'string'");
    }
    inputKeyword = inputKeyword.trim();

    if (!inputKeyword) {
      alert('Empty request detected');
      return;
    }

    //Note: The limit on the length of the search request should be within 2048 characters.
    if (inputKeyword.length > 2000) {
      alert('too many words');
      return null;
    }
    const request = `intitle:"${inputKeyword}"`;

    if (!excelData) {
      alert('First upload your file.xlsx \n\rYou can use example.xlsx for correct data structure');
      return null;
    }

    if (!googleProfl) {
      alert('First you need to register');
      return null;
    }

    if (!isAvailableRequest()) {
      return null;
    }

    /**
     * RETURN FALSE AT ALL
     * MODIFY UserProjectProffile after finish calculation !!!!
     * add after "dispatchExcelData"
     */
    requestCount; //delete this too

    // fireStore.modifyUser({ uid: googleProfl.uid, requestCount: requestCount });
    // return false;

    setToolRun(true);
    userQuery.current = inputKeyword;

    const resultURLObjects = await calcThematicityIndex({
      arrURL_objects: excelData.urlObjects,
      query: request,
      onUpdate: progressHandler,
      onError: errorHandler,
    });

    isUserUseTool.current = true;
    dispatchExcelData({ type: 'MODIFY', urlObjects: resultURLObjects });
  };

  //Check how much request user can do
  function isAvailableRequest() {
    if (!excelData) return false;
    if (!projProfl) return false;

    const currentRequestCount = (() => {
      return excelData.urlObjects.reduce((sum, urlObj) => {
        if (urlObj.url === '') return sum;
        return ++sum;
      }, 0);
    })();

    console.log(currentRequestCount);

    setRequestCount(currentRequestCount);
    const requestCount_excludeFreeRequest = currentRequestCount - projProfl.freeRequest;

    if (currentRequestCount > 10000) {
      alert(
        'Sorry but Thematicity index has limit 5000 request per day. If you want do more request, please contact with us. We solve this problem!'
      );
      return false;
    }
    if (requestCount_excludeFreeRequest <= 0) return true;
    if (requestCount_excludeFreeRequest * pricePerRequest > projProfl.walletBalance) {
      alert(
        `You can do ${
          Math.trunc(projProfl.walletBalance / pricePerRequest) + projProfl.freeRequest
        } index calculations, but tool got ${currentRequestCount} urls`
      );
      return false;
    }

    return true;
  }

  return (
    <section className="thematicityIndex">
      <div className={style.container}>
        <div className={style.userInf}>
          {projProfl ? (
            <>
              <div className={style.userInf__freeReq}>
                You have: {projProfl.freeRequest} free calculations
              </div>
              <div className={style.userInf__walletBal}>
                Wallet balance: {projProfl.walletBalance}$
              </div>
            </>
          ) : (
            <div className={style.userInf__unAuthMessage}>
              Sign up now and get 20 free thematicity index calculation per day!
            </div>
          )}
        </div>

        <InputFile onFileUpload={handleFileUpload} />
        <aside className={style.acceptedFiles}>
          <div className={style.acceptedDescription}>
            {upLoadedFile ? <p>{`Uploaded file: ${upLoadedFile?.name}`}</p> : null}
          </div>
        </aside>

        <form onSubmit={formHandler} className={style.form}>
          <div className={style.formContainer}>
            <label htmlFor="ThemIndRequest">Write keyword or theme</label>
            <input
              id="ThemIndRequest"
              name="request"
              type="text"
              className={style.formInput}
              placeholder="koala"
              required
            />
            <ButtonCommon
              className={isToolRun ? style.formBtn_active : ''}
              type="submit"
              text={isToolRun ? 'Index Is Calculated' : 'Get Thematicity Index'}
            />
          </div>
        </form>

        <div className={style.errorContainer}>{errorMessage}</div>
        <div className={style.logContainer}>{logProgress}</div>
        <div className={style.loadBtnContainer}>
          <ButtonCommon onClick={handleCreateExample} text={'Download Example'} />
          <ButtonCommon onClick={handleLoadResult} text={'Load Result'} />
        </div>
      </div>
    </section>
  );
};

export default ThematicityIndex;
