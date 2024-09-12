import './App.css';
import { Constants } from './Constants';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import Markdown from 'react-markdown';
import file from './README'

let x, y;

const LineChart = () => {
  const paramZip =
    window.location.href.match(/\d{5}/) &&
    window.location.href.match(/\d{5}/)[0];

  const [zipcode, setZipcode] = useState(paramZip || '94108');
  const [userCity, setUserCity] = useState('San Francisco, CA');
  const [values, setValues] = useState([]);
  const [error, setError] = useState(false);
  const [cityError, setCityError] = useState(false);
  const today = new Date(new Date().toLocaleDateString());
  const time = new Date(new Date().toLocaleString());
  const [hour, setHour] = useState(time.getHours());
  const [minutes, setMinutes] = useState(time.getMinutes());
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

  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  // const getExposure = (index) => Constants.exposure[index];

  const updateTitle = (values) => {
    const value = Object.fromEntries(values)[hour] || '0';
    document.title = `UV Index: ${Constants.boldNums[value]} ${Constants.exposure[value]}`;
    document.querySelector('[name="theme-color"]').content = Constants.colors[value].color;
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

  const getValues = async () => {
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
        setCityError(true);
      }
    }
  };

  const inputRef = useRef(null);
  const inputRefCity = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
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
    getValues();
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
      }; fill: ${error && Constants.colors[7].color}; font-style: ${
        error && 'italic'
      }">${zipcode} </span>${zipcode.length === 5 ? "in" : ""}<span> ${cityName}</span>`,
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
        zones: Constants.colors,
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
            Constants.exposure[point.y] +
            '</strong>'
          );
        }, formatTime(this.x));
      },
      shared: true,
      borderRadius: 22,
    },
    xAxis: {
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
              Constants.exposure[
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
  };


  
  const [markdown, setMarkdown] = useState("");
  const [showMarkdown, setShowMarkdown] = useState(false);

  useEffect(() => {
    fetch(file)
      .then((res) => res.text())
      .then((text) => setMarkdown(text));
  }, []);

  return (
    
    <div>
      <button 
        id="markdown-button"
        title="Readme info"
        onClick={()=> setShowMarkdown(!showMarkdown)}
      >
        <i>{showMarkdown ? 'x' : 'i'}</i>
      </button>
      
      { showMarkdown && 
        <section id="markdown">
          <Markdown children={markdown} />
        </section>
      }
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
            Zipcode:&#8239;
            <input
              style={{ width: '4em', color: error ? Constants.colors[7].color : "inherit" }}
              type="tel"
              pattern="^\d*$"
              name="zipcode"
              placeholder="12345"
              value={zipcode}
              maxLength="5"
              ref={inputRef}
              onChange={(e) => {
                setError(false);
                zipcode.length === 5 && getValues();
                setZipcode(e.target.value.replace(/\D/, '').slice(0, 5));
              }}
            />
          </label>
          <label htmlFor="city">
            City, State:&#8239;
            <input
              style={{ width: '10em', color: cityError ? Constants.colors[7].color : "inherit" }}
              type="text"
              pattern="^[a-z], *[A-Z]{2}*$"
              name="city"
              placeholder="Seattle, WA"
              value={userCity}
              ref={inputRefCity}
              onChange={(e) => {
                setCityError(false);
                setUserCity(e.target.value.replace(/\d/, ''));
                userCity.length > 3 &&
                  userCity?.split(/, */)[1]?.length === 2 &&
                  getCityValues();
              }}
            />
            <button
              style={{ marginRight: '1em', lineHeight: 1.2, opacity: 0.7 }}
              title={ userCity?.split(/, */)[1]?.length !== 2 ? "city must be followed by a comma and 2 letter state code" : "Search for city" }
              onClick={(e) => {
                getCityValues();
                e.preventDefault();
              }}
              disabled={userCity?.split(/, */)[1]?.length !== 2}
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
              getValues();
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
