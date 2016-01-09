import _ from 'lodash';

export default {
  title(string) {
    document.title = `${string} | Budgetal`;
  },

  userAuthenticated() {
    var cookie = module.exports.getCookie('signed_in');
    return cookie == 'true';
  },

  remainingClass(number) {
    if (_.lt(number, 0.00)) {
      return 'alert-color';
    } else if (_.gt(number, 0.00)) {
      return 'success-color';
    } else {
      return 'blue-color';
    }
  },

  today() {
    var date  = new Date;
    var year  = date.getFullYear();
    var month = pad(date.getMonth() + 1);
    var day   = pad(date.getDate());
    return `${year}-${month}-${day}`;
  },

  monthName(number) {
    var months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    return months[parseInt(number)-1]
  },

  selectedValue(selector) {
    var element = document.querySelector(selector);
    return element.options[element.selectedIndex].value;
  },

  numberToCurrency(number, dollarSign='$') {
    if (isNaN(parseFloat(number))) { number = 0 }
    var group3Regex = /(\d)(?=(\d{3})+\.)/g
    var number = parseFloat(number).toFixed(2);
    return dollarSign + number.replace(group3Regex, '$1,');
  },

  urlParams() {
    var pathNames  = window.location.pathname.split('/');
    var yearIndex  = pathNames.length - 2;
    var monthIndex = pathNames.length - 1;
    return {month: pathNames[monthIndex], year: pathNames[yearIndex]};
  },

  yearOptions() {
    let maxYear = (new Date).getFullYear() + 3;
    let years = _.range(2015, maxYear);
    return _.map(years, (year, index) => {
      return (<option key={index} value={year}>{year}</option>);
    });
  },

  monthOptions() {
    let months = _.range(1, 13);
    return _.map(months, (month, index) => {
      return (<option key={index} value={month}>{module.exports.monthName(month)}</option>);
    });
  },

  getCookie(name) {
    var name = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
  }
}

function pad(number, char='0') {
  if (number < 10) {
    number = `${char}${number}`;
  }
  return number;
}