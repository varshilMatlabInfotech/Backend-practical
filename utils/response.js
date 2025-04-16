// /middlewares/response.js
exports.response = {
  success: (res, message = "Success", data = null, status = 200) => {
    return res.status(status).json({ success: true, message, data });
  },

  error: (res, message = "Error", status = 500) => {
    return res.status(status).json({ success: false, message });
  },

  validationError: (res, errors) => {
    return res.status(400).json({ success: false, message: "Validation Error", errors });
  },

  unauthorized: (res, message = "Unauthorized") => {
    return res.status(401).json({ success: false, message });
  },
};

// module.exports = responseHandler;
