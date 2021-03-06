import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { FormField } from 'src/common/types/client';
import { postSession } from 'src/modules/auth/api';
import Form, { FormValues } from 'src/common/components/Form';
import { border, fullscreenCenteredFlex } from 'src/common/styles';

const style = { ...border, p: 1.5 };

function LoginPage() {
  const router = useRouter();

  const { redirect } = router.query;

  const [expired, setExpired] = useState('');

  useEffect(() => {
    // session bleibt im backend, localstorage nur um zu zeigen, dass es eine gab und diese expired ist
    if (window) setExpired(window.sessionStorage.getItem('session') ?? '');
  }, []);

  const handleSubmit = async (values: FormValues) => {
    await postSession(values);
    // wenn login ok: speichern um zu sehen ob user schon eingeloggt war
    // dann kommt bei response mit 401 "session abgelaufen"
    window.sessionStorage.setItem('session', 'true');

    router.push(typeof redirect === 'string' ? redirect : '/');
  };

  const fields: FormField[] = [
    { name: 'username', label: 'Benutzer', type: 'text', required: true },
    { name: 'password', label: 'Passwort', type: 'password', required: true },
  ];

  return (
    <Box sx={fullscreenCenteredFlex}>
      {expired === 'true' ? (
        <Box>
          <Typography color="error">Die Sitzung ist abgelaufen</Typography>
        </Box>
      ) : null}

      <Box sx={style}>
        <Form
          onSubmit={handleSubmit}
          fields={fields}
          size="sm"
          submitName="Anmelden"
        />
      </Box>
    </Box>
  );
}

export default LoginPage;
