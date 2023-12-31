/**
 * https://developers.google.com/custom-search/v1/overview
 * Custom Search JSON API provides 100 search queries per day for free.
 * If you need more, you may sign up for billing in the API Console.
 * Additional requests cost $5 per 1000 queries, up to 10k queries per day.
 * $0.005 per query, $0.005 for Insertion, $0.006 for Insertion + 20% profit*/

import { AxiosResponse } from 'axios';
import throttling from '@/utils/throttling';
import { InputData } from '@/containers/reducers/inputDataSlice';
import googleSearch from '@/services/googleSearch';
import countryList from '@/services/config/countryList';

interface GetLinkInsertionProps {
  inputDataArr: InputData[];
  query: string;
  keyWord?: string;
  location?: string;
  onUpdate?: (progress: string) => void;
  onError?: (errorMessage: string, response?: AxiosResponse) => void;
}

interface SiteFields {
  link: string;
  title: string;
  snippet: string;
}

async function getLinkInsertion({
  inputDataArr,
  query,
  keyWord,
  location,
  onUpdate,
  onError,
}: GetLinkInsertionProps) {
  /**
   *    ABOUT DELAY SETTINGS
   *
   * 1. limit_package_urls -- (work with fixed count of urls)
   * 2. step -- do request for one url
   */

  const limit_package_urls = 10; //value set limit for count of site urls, which process in one iteration.
  const delay_between_iterations = 300; //value set delay after finish each iteration in MILLISECONDS. 66000 milliseconds = 66 seconds
  const delay_between_steps = 150; //value set delay before each request in MILLISECONDS. 130 milliseconds = 0.13 second

  try {
    const cloneDataArr = JSON.parse(JSON.stringify(inputDataArr)); //clone inputData
    return await getInsertion(cloneDataArr);
  } catch (error) {
    console.error(error);
    return undefined;
  }

  //
  async function getInsertion(cloneDataArr: InputData[]): Promise<InputData[] | undefined> {
    const siteUrls: string[] = [];
    let countryCode;

    if (location && location !== '') {
      countryCode = countryList.code(location);

      if (!countryCode) {
        if (onError)
          onError(
            'Enter the correct country name or country code. Full list of countries:\n\rhttps://rextheme.com/google-country-codes-list/'
          );
        return undefined; //return data without changes
      }
    }

    for (const cloneData of cloneDataArr) {
      const siteUrl = cloneData.url;
      siteUrls.push(siteUrl);
    }

    for (
      let iteration = 0, siteURL = siteUrls[0];
      iteration < siteUrls.length;
      iteration++, siteURL = siteUrls[iteration]
    ) {
      //Await Iteration Delay
      if (iteration % limit_package_urls === 0 && iteration !== 0) {
        if (onUpdate) {
          onUpdate(`Processed urls: ${iteration}`); //update value in real time after each iteration
        }
        await throttling(delay_between_iterations);
      }
      //for last value
      if (onUpdate && iteration === siteUrls.length - 1) {
        onUpdate(`All urls processed: ${siteUrls.length}`);
      }

      if (siteURL === '') {
        continue;
      }

      const searchResult = await googleSearch.withQuery(siteURL, query, keyWord, countryCode);

      if (searchResult instanceof Error) {
        if (onError) onError(searchResult.message);
        continue;
      }
      if (!searchResult.items?.length) {
        cloneDataArr[iteration].targetPage = 0;
        cloneDataArr[iteration].links = [];
        continue;
      }

      await throttling(delay_between_steps);
      const siteInformation = searchResult.items as SiteFields[];

      if (siteInformation.length > 5) siteInformation.length = 5; //cut to 5 entities
      const links = siteInformation.map(site => site.link);
      cloneDataArr[iteration].links = links;
      cloneDataArr[iteration].targetPage = Number(searchResult.searchInformation.totalResults);
    }
    return cloneDataArr;
  }
}

export default getLinkInsertion;
