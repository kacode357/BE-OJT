import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../../modules/auth';
import { nanoid } from 'nanoid';
import moment from 'moment';
import { DATE_FORMAT } from '../constants';

export const getUserIdCurrent = (authHeader: string) => {
    if (!authHeader) {
        return '';
    }
    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_TOKEN_SECRET ?? '') as DataStoredInToken;
    return user;
};

export const isEmptyObject = (obj: any): boolean => {
    return !Object.keys(obj).length;
};

export const formatResponse = <T>(data: T, success: boolean = true) => {
    return {
        success,
        data,
    };
};

export const generateRandomNo = (PREFIX_TITLE: string, numberLimit = 6) => {
    const uniqueId = String(nanoid(numberLimit)).toUpperCase(); // Generate a unique NO with numberLimit characters
    const yyyymmdd = moment().format(DATE_FORMAT.YYYYMMDD); // Format current date as YYYYMMDD
    return `${PREFIX_TITLE}_${uniqueId}${yyyymmdd}`;
};
