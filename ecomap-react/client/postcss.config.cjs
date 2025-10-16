module.exports = {
  plugins: {
    // Use o pacote @tailwindcss/postcss (wrapper) em vez de passar
    // 'tailwindcss' diretamente quando a mensagem de erro exigir isso.
    // Caso você prefira usar o 'tailwindcss' diretamente, verifique a
    // versão instalada — algumas versões mais novas continuam funcionando
    // sem o wrapper.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  }
};
