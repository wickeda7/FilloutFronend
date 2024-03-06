import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import qs from 'qs';

interface FilterClauseType {
  id: string;
  condition: string;
  value: number | string;
}

const selectOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'does_not_equal', label: 'Does not equal' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
];
function App() {
  const [val, setVal] = useState<FilterClauseType>({ id: '', condition: 'equals', value: '' });
  const [data, setData] = useState<Array<FilterClauseType>>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [response, setResponse] = useState<string>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    setError('');
    if (val.id === '' && val.value === '') {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [val]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setVal({ ...val, [name]: value });
  };
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setVal({ ...val, condition: event.target.value });
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVal({ id: '', condition: 'equals', value: '' });
    setData([...data, val]);
  };
  const submit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (data.length === 0) {
      setError('no data');
      return;
    }
    if (disabled) {
      setError('Please fill all fields or click Add');
      return;
    }

    const filtetsObject = data.reduce((acc: { [key: string]: FilterClauseType }, value, idx) => {
      acc[`filter[${idx}]`] = value;
      return acc;
    }, {});
    const stringify = qs.stringify({ ...filtetsObject, limit: 10 });
    try {
      const url = `https://fillout-gqua.onrender.com/cLZojxk94ous/filteredResponses?${stringify}`;
      console.log('url: ', url);
      const res = await axios.get(url);
      // const res = await axios.get(`http://localhost:8080/cLZojxk94ous/filteredResponses?${stringify}`);
      setResponse(res.data);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        return error.message;
      } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred';
      }
    }
  };
  return (
    <div className='App'>
      <div className='main'>
        <div className='left'>
          <div className='result'>
            {data.length > 0 &&
              data.map((d, i) => {
                const cond = selectOptions.find((o) => o.value === d.condition);
                return (
                  <div key={i} style={{ margin: 5, width: 750, textAlign: 'left' }}>
                    {i + 1}. {d.id} {cond?.label} {d.value}
                  </div>
                );
              })}
          </div>
          <form onSubmit={(e) => handleSubmit(e)} className='.form-inline'>
            <div className='flexRow'>
              <label htmlFor='id' className='label'>
                ID:
              </label>
              <label htmlFor='condition' className='label'>
                Condition
              </label>
              <label htmlFor='value' className='label'>
                Value
              </label>
              <label htmlFor='' className='label'></label>
            </div>
            <div className='flexRow'>
              <input type='text' value={val.id} onChange={handleChange} name='id' className='input' />

              <select className='input' name='condition' onChange={handleSelectChange} value={val.condition}>
                {selectOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input type='text' name='value' className='input' onChange={handleChange} value={val.value} />
              <button type='submit' className='add'>
                Add
              </button>
            </div>
          </form>
          <div className='result'>
            {error && (
              <div className='flexRow, error' style={{ marginBottom: 20 }}>
                {error}
              </div>
            )}

            <button className='submit' onClick={submit}>
              Submit
            </button>
          </div>
        </div>
        <div className='right'>
          {response && (
            <div className='content'>
              <pre>
                <code>{JSON.stringify(response, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
