import './App.css';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { render } from 'react-dom';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

let x, y;

const LineChart = () => {
  const paramZip =
    window.location.href.match(/\d{5}/) &&
    window.location.href.match(/\d{5}/)[0];

  const [postalCode, setPostalCode] = useState(paramZip || '95377');

  const [zipcode, setZipcode] = useState(paramZip || '94108');
  const [userCity, setUserCity] = useState('San Francisco, CA');
  const [values, setValues] = useState([]);
  const [error, setError] = useState(false);
  const [cityError, setCityError] = useState(false);
  const today = new Date(new Date().toLocaleDateString());
  const tomorrow = new Date(
    new Date().setDate(new Date().getDate() + 1)
  ).toLocaleDateString();
  const yesterday = new Date(
    new Date().setDate(new Date().getDate() - 1)
  ).toLocaleDateString();
  const time = new Date(new Date().toLocaleString());
  const [hour, setHour] = useState(time.getHours());
  const [minutes, setMinutes] = useState(time.getMinutes());
  const todayString = today.toISOString().slice(0, 10);
  const todayAPI = todayString.replace(/-/g, '');
  const yesterdayAPI = new Date(yesterday)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const tomorrowAPI = new Date(tomorrow)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const [apiDate, setApiDate] = useState(todayAPI);
  // const [isFetched, setIsFetched] = useState(false);
  const [cityName, setCityName] = useState('city, state');
  const [dataDate, setDataDate] = useState(today);
  const [isEditing, setEditing] = useState(false);
  const toggleEditing = () => {
    setZipcode('');
    setUserCity('');
    setEditing(!isEditing);
    setError(false);
  };

  const toggleCityEditing = () => {
    setUserCity('');
    setZipcode('');
    setEditing(!isEditing);
    setCityError(false);
  };

  const exposure = [
    'low',
    'low',
    'low',
    'moderate',
    'moderate',
    'moderate',
    'high',
    'high',
    'very high',
    'very high',
    'very high',
    'extreme',
    'extreme',
    'extreme',
    'extreme',
    'extreme',
  ];

  const emojiNums = [
    '0️⃣',
    '1️⃣',
    '2️⃣',
    '3️⃣',
    '4️⃣',
    '5️⃣',
    '6️⃣',
    '7️⃣',
    '8️⃣',
    '9️⃣',
    '🔟',
    '1️⃣1️⃣',
    '1️⃣2️⃣',
    '1️⃣3️⃣',
    '1️⃣4️⃣',
    '1️⃣5️⃣',
  ];

  const boldNums = [
    '𝟎',
    '𝟏',
    '𝟐',
    '𝟑',
    '𝟒',
    '𝟓',
    '𝟔',
    '𝟕',
    '𝟖',
    '𝟗',
    '𝟏𝟎',
    '𝟏𝟏',
    '𝟏𝟐',
    '𝟏𝟑',
    '𝟏𝟒',
    '𝟏𝟓',
  ];

  const doubleNums = [
    '𝟘',
    '𝟙',
    '𝟚',
    '𝟛',
    '𝟜',
    '𝟝',
    '𝟞',
    '𝟟',
    '𝟠',
    '𝟡',
    '𝟘',
    '𝟙𝟙',
    '𝟙𝟚',
    '𝟙𝟛',
    '𝟙𝟜',
    '𝟙𝟝',
  ];

  const sansNums = [
    '𝟢',
    '𝟣',
    '𝟤',
    '𝟥',
    '𝟦',
    '𝟧',
    '𝟨',
    '𝟩',
    '𝟪',
    '𝟫',
    '𝟣𝟢',
    '𝟣𝟣',
    '𝟣𝟤',
    '𝟣𝟥',
    '𝟣𝟦',
    '𝟣𝟧',
  ];

  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const getExposure = (index) => exposure[index];

  const updateTitle = (values) => {
    const value = Object.fromEntries(values)[hour] || '0';
    document.title = `🌻 UV Index: ${boldNums[value]} ${exposure[value]}`;
    console.log({ values });
  };

  useEffect(() => {
    const handler = ({ key }) => key === 'Escape' && toggleEditing();
    window.addEventListener('keydown', handler);
    return () => {
      // This is the cleanup function
      window.removeEventListener('keydown', handler);
    };
  }, []);

  const setFormatDataValues = (jsonData) => {
    setValues(
      jsonData
        ?.filter(
          (x, i) =>
            x.UV_VALUE != 0 ||
            jsonData[i - 1]?.UV_VALUE > 0 ||
            jsonData[i + 1]?.UV_VALUE > 0
        )
        .map((x) => [
          new Date(
            x.DATE_TIME.replace(/ AM/, ':00 am').replace(/ PM/, ':00 pm')
          ).getHours(),
          x.UV_VALUE,
        ])
    );
  };

  const getXY = () => {
    const error = (error) => console.error(error.message);
    navigator.geolocation.getCurrentPosition(useXY, error);
  };

  const useXY = async (position) => {
    const coords = position.coords;
    try {
      const response = await fetch(
        `https://data.epa.gov/efservice/getEnvirofactsUVHourly/LATITUDE/${coords.latitude}/LONGITUDE/${coords.longitude}/JSON`
      );
      const jsonData = await response.json();
      console.log(jsonData);
      setFormatDataValues(jsonData);
      console.log(jsonData);
      console.log(values);
      const [city, state] = [jsonData[0].CITY, jsonData[0].STATE];
      setCityName(`${city}, ${state}`);
      setDataDate(new Date(jsonData[0].DATE_TIME.split(' ')[0]));
      setError(false);
      setZipcode('');
    } catch (error) {
      console.error(error.message);
      console.error(x, y, 'is not found!');
    }
  };

  const getValues = async (apiDate = todayAPI) => {
    if (zipcode.length === 5) {
      try {
        const response = await fetch(
          `https://data.epa.gov/efservice/getEnvirofactsUVHourly/ZIP/${zipcode}/JSON`
        );
        const jsonData = await response.json();
        setFormatDataValues(jsonData);
        console.log(jsonData);
        console.log(values);
        const [city, state] = [jsonData[0].CITY, jsonData[0].STATE];
        setCityName(`${city}, ${state}`);
        setDataDate(new Date(jsonData[0].DATE_TIME.split(' ')[0]));
        setError(false);
      } catch (error) {
        console.error(error.message);
        console.error(zipcode, 'is not found!');
        setError(true);
      }
    }
  };

  const getCityValues = async () => {
    if (!!userCity.match(/[a-z+], *[A-Z]{2}/i)) {
      const splitCity = userCity.trim().split(/\s*,/);
      try {
        const response = await fetch(
          `https://data.epa.gov/efservice/getEnvirofactsUVHourly/CITY/${splitCity[0].trim()}/STATE/${splitCity[1].trim()}/JSON`
        );
        const jsonData = await response.json();
        setFormatDataValues(jsonData);
        console.log(jsonData);
        console.log(values);
        const [city, state] = [jsonData[0].CITY, jsonData[0].STATE];
        setCityName(`${city}, ${state}`);
        setDataDate(new Date(jsonData[0].DATE_TIME.split(' ')[0]));
        setCityError(false);
        setZipcode('');
      } catch (error) {
        console.error(error.message);
        console.error(userCity, 'is not found!');
        setError(true);
      }
    }
  };

  const inputRef = useRef(null);
  const inputRefCity = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      let date = new Date();
      setMinutes(new Date(new Date().toLocaleString()).getMinutes());
      setHour(new Date(new Date().toLocaleString()).getHours());
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (zipcode.length < 5) {
      inputRef.current.focus();
      setError(false);
    }
  }, [isEditing]);

  useEffect(() => {
    if (userCity.length < 3) {
      inputRefCity.current.focus();
      setError(false);
    }
  }, [isEditing]);

  useEffect(() => {
    updateTitle(values);
  }, [hour, values, zipcode]);

  useMemo(() => {
    getValues(apiDate);
  }, [zipcode]);

  const zeroPad = (num, places) => String(num).padStart(places, '0');
  const formatTime = (num) => {
    if (num == 0 || num == 24) {
      return '12 am';
    } else if (num > 0 && num < 12) {
      return `${num} am`;
    } else if (num == 12) {
      return `12 pm`;
    } else if (num > 12 && num < 24) {
      return `${num - 12} pm`;
    } else {
      return num;
    }
  };

  const colors = [
    {
      value: 1,
      color: '#4eb600',
    },
    {
      value: 2,
      color: '#4eb600',
    },
    {
      value: 3,
      color: '#99cc02',
    },
    {
      value: 4,
      color: '#f8e200',
    },
    {
      value: 5,
      color: '#f7b501ff',
    },
    {
      value: 6,
      color: '#f88600ee',
    },
    {
      value: 7,
      color: '#f95900cc',
    },
    {
      value: 8,
      color: '#e82a0eaa',
    },
    {
      value: 9,
      color: '#d7031a99',
    },
    {
      value: 10,
      color: '#ff029888',
    },
    {
      value: 11,
      color: '#b449ff',
    },
    {
      value: 12,
      color: '#9a8aff',
    },
    {
      value: 13,
      color: '#9a8aff',
    },
    {
      value: 14,
      color: '#9a8aff',
    },
    {
      color: '#9a8aff',
    },
  ];

  const changeDate = (api) => {
    setApiDate(api);
    getValues(api);
  };
  const chartOptions = {
    style: {
      color: '#ddd',
    },
    chart: {
      type: 'spline',
      // backgroundColor: '#131313',
      backgroundColor: '#eee0',
    },
    title: {
      text: `UV Index for <span style="opacity: ${
        0.5 + zipcode.length / 10
      }; fill: ${error && '#e82a0eaa'}; font-style: ${
        error && 'italic'
      }">${zipcode}</span><span> ${cityName}</span>`,
    },
    subtitle: {
      text: `
      ${
        today.getDay() === new Date(dataDate)?.getDay() ? 'Today' : 'Tomorrow'
      }: ${new Date(dataDate)?.toLocaleDateString('US-en', dateOptions)}`,
    },
    series: [
      {
        name: cityName,
        data: values,
        style: {
          // color: '#ddd',
        },
        // lineWidth: '3',
        dataLabels: {
          enabled: true,
          padding: 7,
          color: '#555',
          style: {
            fontSize: '1rem',
          },
        },
        zones: colors,
        shadow: false,
        events: {
          legendItemClick: () => false
        }
      },
    ],
    credits: {
      enabled: false,
    },
    tooltip: {
      crosshairs: true,
      crosshairs: {
        snap: false,
        zIndex: 1,
      },
      followPointer: true,
      formatter: function () {
        return this.points.reduce(function (s, point) {
          return (
            s +
            '<br/>' +
            point.y +
            ': <strong>' +
            exposure[point.y] +
            '</strong>'
          );
        }, formatTime(this.x));
      },
      shared: true,
      borderRadius: 22,
    },
    xAxis: {
      // categories: values.map((x) =>
      //   x[0].slice(5).replace(/^0/, '').replace(/\s/, ' ').toLowerCase()
      // ),
      gridLineWidth: 1,
      gridZIndex: 0,
      plotLines: [
        {
          zIndex: 2,
          color: 'cornflowerblue',
          width: 2,
          value: hour + minutes / 60,
          label: {
            text: `${new Date(
              Date.parse(`0000-01-01 ${zeroPad(hour)}:${zeroPad(minutes)}`)
            )
              .toLocaleTimeString()
              .replace(/:00 AM/, ' am')
              .replace(/:00 PM/, ' pm')}, <strong>${
              exposure[
                {
                  ...values.filter(
                    (x) => x[0] === Math.round(hour + minutes / 60)
                  )[0],
                }[1]
              ]
            }</strong>`,
            textAlign: `${hour < 13 ? 'left' : 'right'}`,
            verticalAlign: 'top',
            fontSize: 12,
            style: {
              fontSize: '1rem',
              transform: `translate(${
                hour < 13 ? '.25rem' : '-.9rem'
              }, 1.2rem)`,
              color: '#333',
            },
            rotation: 0,
          },
        },
      ],
      tickInterval: 1,
      dateTimeLabelFormats: {
        hour: {
          main: '%l',
        },
      },
      labels: {
        formatter() {
          // eslint-disable-next-line react/no-this-in-sfc
          const label = this.axis.defaultLabelFormatter.call(this);
          return formatTime(label);
        },
        style: {
          // color: '#ddd',
        },
      },
      crosshairs: {
        snap: false,
        color: 'gray',
        dashStyle: 'shortdot',
        width: 1,
      },
    },
    yAxis: {
      allowDecimals: false,
      title: '',
      max: 12,
      gridZIndex: -1,
      labels: {
        style: {
          // color: '#ddd',
        },
      },
    },
    // plotOptions: {
    //   series: {
    //     point: {
    //       events: {
    //         mouseOver(e) {
    //           setHoverData(e.target.category);
    //         },
    //       },
    //     },
    //   },
    // },
  };

  return (
    <div>
      <HighchartsReact
        containerProps={{
          style: {
            height: 'calc(100vh - 9em)',
            width: 'calc(100vw - 2em)',
            position: 'fixed',
            backgroundColor: '#eee0',
          },
        }}
        highcharts={Highcharts}
        options={chartOptions}
      />
      {/* <h3>Hovering over {hoverData}</h3> */}
      <div style={{ padding: 'calc(100vh - 9.25em) 1em 1em', zIndex: '-5' }}>
        <form
          style={{
            backgroundColor: '#fff0',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        ></form>

        <form
          style={{
            marginTop: '1em',
            backgroundColor: '#fff0',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <label htmlFor="zipcode">
            Zipcode:
            <input
              style={{ width: '4em' }}
              type="tel"
              pattern="^\d*$"
              name="zipcode"
              value={zipcode}
              maxLength="5"
              ref={inputRef}
              onChange={(e) => {
                zipcode.length === 5 && getValues(apiDate);
                setZipcode(e.target.value.replace(/\D/, '').slice(0, 5));
              }}
            />
          </label>
          <label htmlFor="city">
            City, State:
            <input
              style={{ width: '10em' }}
              type="text"
              pattern="^[a-z], *[A-Z]{2}*$"
              name="city"
              value={userCity}
              ref={inputRefCity}
              onChange={(e) => {
                setUserCity(e.target.value.replace(/\d/, ''));
                userCity.length > 3 &&
                  userCity?.split(/\, */)[1]?.length === 2 &&
                  getCityValues();
              }}
            />
            <button
              style={{ marginRight: '1em', lineHeight: 1.2, opacity: 0.7 }}
              onClick={(e) => {
                getCityValues();
                e.preventDefault();
              }}
              disabled={userCity?.split(/\, */)[1]?.length !== 2}
            >
              🔍
            </button>
            <button
              style={{ marginRight: '1em' }}
              onClick={(e) => {
                e.preventDefault();
                toggleCityEditing();
              }}
            >
              clear
            </button>
          </label>
          <button
            onClick={(e) => {
              // useXY();
              getXY();
              getValues(apiDate);
              e.preventDefault();
              // console.log(x, y, 'aaaaa');
            }}
          >
            use my location
          </button>
        </form>
      </div>
    </div>
  );
};

export default LineChart;
