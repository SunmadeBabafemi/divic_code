export const formatPhoneNumber = (phone_number: String) => {
  const stringed = String(phone_number);
  let formated: string;
  formated = "+234" + stringed.slice(-10);
  return formated;
};

export const randomStrings = (word: string) => {
  return (
    (Math.random() + 1).toString(36).substring(7) +
    '-' +
    word.split(' ').join('_')
  );
};

export const addWeeksToDate = (dateObj: Date, numberOfWeeks: number) => {
  dateObj.setDate(dateObj.getDate() + numberOfWeeks * 7);
  return dateObj;
}

export const verificationCode = () => {
  const code = Math.floor(1000 + Math.random() * 9000);
  return code;
};

export const getRandomRef = () => {
  const getRef = () => {
    var nums = "0123456789";
    var rand = "";
    for (var i = 0; i < 5; i++) {
      rand += nums[Math.floor(Math.random() * 10)];
    }
    return rand;
  };
  let randRef = "Telagri" + getRef() + Date.now();

  return randRef;
};

export const convertNairaToKobo = (amount: number) => {
  const koboValue = Number(amount) * 100;
  return koboValue;
};

export const getRandomNumbers = (length: number) => {
  const getRef = () => {
    var nums = "0123456789";
    var rand = "";
    for (var i = 0; i < length; i++) {
      rand += nums[Math.floor(Math.random() * 10)];
    }
    return rand;
  };
  let randRef = getRef();

  return randRef;
};

