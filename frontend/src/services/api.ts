import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

//Перехватчик для обработки истечения срока действия токена или других ошибок аутентификации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
//При возникновении ошибки 401 (не авторизован) разлогиниваем пользователя
      //Предполагаем, что 401 возникает в основном из-за проблем с токеном
      //Можно обработать это более изящно, например, попытавшись обновить токен
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
//Перенаправляем на страницу входа. Это стандартный подход.
      //Убеждаемся, что это не вызовет зацикливания, если сама страница входа делает API-запрос, который завершается ошибкой.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;