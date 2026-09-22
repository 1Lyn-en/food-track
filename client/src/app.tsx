import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import FoodMapPage from './pages/FoodMap/FoodMapPage';
import NotFound from './pages/NotFound/NotFound';

const RoutesComponent = () => {
  useEffect(() => {
    document.title = '食迹';
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<FoodMapPage />} />
        <Route path="food-map" element={<FoodMapPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
