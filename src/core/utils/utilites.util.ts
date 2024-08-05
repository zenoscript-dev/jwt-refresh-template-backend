export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
};

export const trimString = (value: string) => {
  return value.replace(/\s/g, '');
};

export const checkEmailValidation = (email: string) => {
  const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return email !== '' && email.match(emailFormat) !== null;
};

export const addIfNotPresent = (arr: any[], num: any) => {
  if (!arr.includes(num)) {
    arr.push(num);
  }
  return arr;
};

export const getSubdomain = (url: string) => {
  let domain = url;
  if (url.includes('://')) {
    domain = url.split('://')[1];
  }
  const subdomain = domain.split('.')[0];
  return subdomain;
};

export const isArrayEqual = (array1: any[], array2: any[]) => {
  if (array1.length != array1.length) return false;

  // Sort both arrays
  array1.sort();
  array2.sort();

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] != array2[i]) return false;
  }

  return true;
};

export const checkPasswordValidation = (value: string) => {
  const isWhitespace = /^(?=.*\s)/;
  if (isWhitespace.test(value)) {
    return 'Password must not contain Whitespaces.';
  }

  const isContainsUppercase = /^(?=.*[A-Z])/;
  if (!isContainsUppercase.test(value)) {
    return 'Password must have at least one Uppercase Character.';
  }

  const isContainsLowercase = /^(?=.*[a-z])/;
  if (!isContainsLowercase.test(value)) {
    return 'Password must have at least one Lowercase Character.';
  }

  const isContainsNumber = /^(?=.*[0-9])/;
  if (!isContainsNumber.test(value)) {
    return 'Password must contain at least one Digit.';
  }

  const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
  if (!isContainsSymbol.test(value)) {
    return 'Password must contain at least one Special Character.';
  }

  const isValidLength = /^.{10,16}$/;
  if (!isValidLength.test(value)) {
    return 'Password must be 10-16 Characters Long.';
  }

  return null;
};

export const sortArray = (array: any[], property: string) => {
  return array.sort((a, b) => {
    return a[property] >= b[property] ? 1 : -1;
  });
};

export const lpadZero = function (str: string, length: number) {
  var padString = '0';
  while (str.length < length) str = padString + str;
  return str;
};

export const removeDuplicates = (arr: any[], key: string) => {
  const uniqueIds = [];
  const unique = arr.filter((element) => {
    const isDuplicate = uniqueIds.includes(element[key]);
    if (!isDuplicate) {
      uniqueIds.push(element[key]);
      return true;
    }
    return false;
  });
  return unique;
};
