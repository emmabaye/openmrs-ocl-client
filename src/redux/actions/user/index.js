import { notify } from 'react-notify-toast';
import { isSuccess, isFetching, isErrored } from '../globalActionCreators';
import {
  GET_USER,
  FETCH_USER_DICTIONARY,
  FETCH_USER_ORGANIZATION,
  CLEAR_DICTIONARY,
  USER_IS_MEMBER,
  USER_IS_NOT_MEMBER,
} from '../types';
import instance from '../../../config/axiosConfig';
import { filterUserPayload } from '../../reducers/util';

export const fetchUser = username => async (dispatch) => {
  const url = `users/${username}/`;
  try {
    const response = await instance.get(url);
    dispatch(isSuccess(response.data, GET_USER));
  } catch (error) {
    notify.show('an error occurred, reload the page', 'error', 3000);
  }
};

export const fetchUserOrganizations = username => async (dispatch) => {
  const url = `users/${username}/orgs/`;
  try {
    const response = await instance.get(url);
    dispatch(isSuccess(response.data, FETCH_USER_ORGANIZATION));
  } catch (error) {
    notify.show('an error occurred, reload the page', 'error', 3000);
  }
};

export const fetchsUserDictionaries = username => async (dispatch) => {
  const url = `/users/${username}/collections/?q=${''}&limit=${0}&page=${1}&verbose=true`;
  try {
    const response = await instance.get(url);
    const result = filterUserPayload(username, response.data);
    dispatch(isSuccess(result, FETCH_USER_DICTIONARY));
    dispatch(isFetching(false));
  } catch (error) {
    notify.show('an error occurred, reload the page', 'error', 3000);
  }
};

export const fetchUserData = username => (dispatch) => {
  dispatch(isFetching(true));
  dispatch(fetchUser(username));
  dispatch(fetchsUserDictionaries(username));
  dispatch(fetchUserOrganizations(username));
};

export const clearDictionaryData = () => (dispatch) => {
  dispatch({ type: CLEAR_DICTIONARY, payload: [] });
};

export const fetchMemberStatus = url => async (dispatch) => {
  let response;
  dispatch(isFetching(true));
  try {
    response = await instance.get(url);
  } catch (error) {
    if (error.response.status === 403 || error.response.status === 404) {
      dispatch(isFetching(false));
      return dispatch(isErrored(false, USER_IS_NOT_MEMBER));
    }
  }
  if (response.data === '' && response.status === 204) {
    dispatch(isFetching(false));
    return dispatch(isSuccess(true, USER_IS_MEMBER));
  }
  return dispatch(isFetching(false));
};
