import React from 'react';
import style from './home.module.scss';
import Hero from './hero/Hero';
import Tools from './tools/Tools';
import { useDispatch } from 'react-redux';
import { deleteUserProfl, setUserProfl } from '@/containers/reducers/userSlice';
import { addInputData, removeInputData } from '@/containers/reducers/inputDataSlice';
import { AppDispatch } from '@/containers/storeRedux';

const Home: React.FC = () => {
  const dispatch = useDispatch() as AppDispatch;

  function handleClick() {
    dispatch(
      setUserProfl({
        displayName: `${Math.random()}`,
        uid: '11111111',
        freeRequest: 1,
        walletBalance: 0.0001,
        lastLogIn: 1702450256459,
        photoURL: 'D:/Projects/site_indexThematicity/src/assets/image/heroAbstrractBackground.svg',
        whenFreebies: 1702450256459,
        email: 'test email',
        phoneNumber: null,
        providerId: 'google',
        allIndexCalculation: 100,
      })
    );
  }

  function handleDelete() {
    dispatch(deleteUserProfl());
  }

  function addDataHandler() {
    // const singleData = { id: 0, name: 'single' };
    const manyData = [
      { id: 4, url: 'test1' },
      { id: 5, url: 'test2' },
      { id: 60, url: 'test3' },
    ];
    dispatch(addInputData(manyData));
  }

  function removeDataHandler() {
    dispatch(removeInputData());
  }

  return (
    <section className="home">
      <div className={style.container}>
        <div className={style.content}>
          <Hero />
          <Tools />
          <button
            style={{ padding: '5px', margin: '5px', backgroundColor: 'beige' }}
            onClick={handleClick}
          >
            Change User Profile
          </button>
          <button
            style={{ padding: '5px', margin: '5px', backgroundColor: 'beige' }}
            onClick={handleDelete}
          >
            Delete User Profile
          </button>
          <button
            style={{ padding: '5px', margin: '5px', backgroundColor: 'beige' }}
            onClick={addDataHandler}
          >
            Add Data
          </button>
          <button
            style={{ padding: '5px', margin: '5px', backgroundColor: 'beige' }}
            onClick={removeDataHandler}
          >
            Remove Data
          </button>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <div id="target1">
            <h2 style={{ paddingTop: '100px' }}>This is target-1</h2>
          </div>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h2 id="target2">
            This is target <br /> This is target
          </h2>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
          <h3>1</h3>
        </div>
      </div>
    </section>
  );
};

export default Home;
