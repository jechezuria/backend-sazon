// Express 4 no captura errores de promesas rechazadas automáticamente.
// Este wrapper envuelve cada controlador async y pasa cualquier error a next(),
// para que termine en el middleware de errores de app.js en lugar de colgar el request.
function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

module.exports = asyncHandler;
