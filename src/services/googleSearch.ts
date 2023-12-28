import RequestError from '@/utils/errorHandlers/requestError';
import axios, { AxiosResponse } from 'axios';
import googleSearchConfig from './config/customGoogleSearch';

//
async function withQuery(siteURL: string, query: string) {
  const apiKey = googleSearchConfig.apiKey;
  const cx = googleSearchConfig.cx;

  /** Search time ~ 0.33s */
  //fields=searchInformation/totalResults used to optimize the query. This is Filter, but response structure will be the same
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=site:${siteURL}%20${encodeURIComponent(
    query
  )}`;
  let response;

  try {
    response = await axios.get(url);
  } catch (error) {
    const axiosError = error as AxiosResponse;

    if (!axios.isAxiosError(axiosError)) {
      return error;
    }
    return handleHTTPError(axiosError, siteURL);
  }

  if (response.status !== 200) {
    return handleHTTPError(response, siteURL);
  }
  const res = response.data;
  return res;
}

//
async function site(siteURL: string) {
  const apiKey = googleSearchConfig.apiKey;
  const cx = googleSearchConfig.cx;

  //fields=searchInformation/totalResults used to optimize the query. This is Filter, but response structure will be the same
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=site:${siteURL}&fields=searchInformation/totalResults`;
  let response;

  try {
    response = await axios.get(url);
  } catch (error) {
    const axiosError = error as AxiosResponse;

    if (!axios.isAxiosError(axiosError)) {
      return error;
    }
    return handleHTTPError(axiosError, siteURL);
  }

  if (response.status !== 200) {
    return handleHTTPError(response, siteURL);
  }
  const res = response.data;
  return res;
}

//
function handleHTTPError(response: AxiosResponse | undefined, siteURL: string) {
  let errorMessage: string;

  if (!response) {
    console.error('Bad request to google search engine');
    return new RequestError('Bad request to google search engine');
  }

  //Axios Error Handler
  if (axios.isAxiosError(response)) {
    const errResponse = response.code;

    if (errResponse === 'ERR_NETWORK') {
      errorMessage = `Error: Network error, check your WI-FI connection`;
    } else if (errResponse === 'ERR_BAD_REQUEST') {
      const status = response.response?.status;

      if (status === 403) {
        errorMessage = `Error with credentials. Error code: ${status}`;
      } else if (status === 429) {
        errorMessage = `Site: ${siteURL}  ||  Error: quota for requests has run out. Error code: ${status}`;
      } else {
        errorMessage = `ERR_BAD_REQUEST: ${status}`;
      }
    } else {
      errorMessage = `Axios Error`;
    }

    console.error(errorMessage);
    return new RequestError(errorMessage);
  }

  //HTTP Answer Handler
  const errCode = response.status;

  if (errCode === 500) {
    errorMessage = `Site: ${siteURL}  ||  Error: internal server error`;
  } else {
    errorMessage = `Site: ${siteURL}  ||  Error code: ${errCode}`;
  }

  console.error(errorMessage);
  return new RequestError(errorMessage);
}

const googleSearch = {
  withQuery,
  site,
};

export default googleSearch;
