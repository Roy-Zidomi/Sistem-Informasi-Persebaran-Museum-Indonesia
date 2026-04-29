import api from './museumApi';

export const askMuseumChatbot = async ({ message, museumId = null, pagePath = '/' }) => {
  const { data } = await api.post('/chat', {
    message,
    museumId,
    pagePath,
  });

  return data;
};
