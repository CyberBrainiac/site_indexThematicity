import locStorage, { locKeys } from '@/utils/localStorage';
import { createEntityAdapter, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type UrlArr = string[];

export interface InputData {
  id: number;
  url: string;
  totalPage?: number;
  targetPage?: number;
  thematicityIndex?: number;
}

const inputDataAdapter = createEntityAdapter();
const initialState = inputDataAdapter.getInitialState();

const inputDataSlice = createSlice({
  name: 'inputData',
  initialState: initialState,
  reducers: {
    removeInputData(state) {
      inputDataAdapter.removeAll(state);
    },
  },

  extraReducers: builder => {
    builder.addCase(addInputData.fulfilled, (state, action) => {
      inputDataAdapter.addMany(state, action.payload);
    });
  },
});

export default inputDataSlice.reducer;

/** Thunk functions */
export const addInputData = createAsyncThunk(
  'inputData/addInputData',
  async (inputData: InputData[] | UrlArr) => {
    const convertedInputData: InputData[] = [];

    for (let i = 0; i < inputData.length; i++) {
      const entity = inputData[i];

      if (typeof entity === 'string') {
        convertedInputData.push({
          id: i,
          url: entity,
        });
      }

      if (typeof entity === 'object') {
        convertedInputData.push(entity);
      }
      continue;
    }

    await locStorage.set(locKeys.inputData, convertedInputData);
    return convertedInputData;
  }
);

//
export const removeInputData = async () => {
  const { removeInputData: actionCreator_removeInputData } = inputDataSlice.actions;

  await localStorage.removeItem(locKeys.inputData);
  return actionCreator_removeInputData();
};
