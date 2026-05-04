import api from './museumApi';

export const askMuseumChatbot = async ({
  message,
  museumId = null,
  pagePath = '/',
  language = 'id',
}) => {
  const { data } = await api.post('/chat', {
    message,
    museumId,
    pagePath,
    language,
  });

  return data;
};
