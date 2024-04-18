export const sendPostRequest = async (
  url: string,
  body: unknown,
  resendRequest: number = 1,
  contentType: string = 'application/json',
): Promise<any> => {
  let response: Response;
  while (resendRequest > 0) {
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      return response.json();
    } catch (error) {
      if (--resendRequest <= 0) {
        throw new Error(error);
      }
    }
  }
};
