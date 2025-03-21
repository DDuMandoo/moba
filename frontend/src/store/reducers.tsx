// src/store/reducers.ts
import { combineReducers, Reducer } from 'redux';

const rootReducer = combineReducers({
 
}) as Reducer<{
  
}>;

export default rootReducer;

// RootState 타입 정의
export type RootState = ReturnType<typeof rootReducer>;
