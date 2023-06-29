import nookies from 'nookies';

const APP_SESSION_PREFIX = 'our-app',
  TWO_HOURS = 2 * 60 * 60;

const serializeAppKey = (key: string) =>
  `${APP_SESSION_PREFIX}:${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

const deserializeAppKey = (key: string) =>
  key
    .slice(APP_SESSION_PREFIX.length + 1)
    .split(/(-[a-z])/gi)
    .map(str => (str.startsWith('-') ? str.slice(1).toUpperCase() : str))
    .join('');

const SessionService = {
  signTo(response: object, payload: object, path = '/'): void {
    const ctx = { res: response },
      options = {
        path,
        maxAge: TWO_HOURS,
        httpOnly: true,
        sameSite: 'strict',
      };

    Object.entries(payload).forEach(([key, value]) =>
      nookies.set(ctx, serializeAppKey(key), value, options)
    );
  },
  getFrom<TSession = {}>(context: object, path = '/'): TSession {
    const cookies = nookies.get(context, {
      path,
      httpOnly: true,
      sameSite: 'strict',
    });

    return Object.entries(cookies).reduce((result, [key, value]) => {
      if (!key.startsWith(APP_SESSION_PREFIX)) return result;
      return {
        ...result,
        [deserializeAppKey(key)]: value,
      };
    }, {} as TSession);
  },
  deleteFrom(context: object, keys: string[] = [], path = '/'): void {
    const options = {
      path,
      httpOnly: true,
      sameSite: 'strict',
    };

    keys
      .map(serializeAppKey)
      .forEach(key => nookies.destroy(context, key, options));
  },
};

export default SessionService;
