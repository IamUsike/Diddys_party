export const verifyUser = async () => {
  try {
    if (!req.user) {
      return res.status(403).json({
        message: "You need to login to get access to the submit form",
      });
    }

    return res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    console.log("Error verifying the user", error.message);
    return res.status(500).json({
      message: "Couldn't verify the user please login again",
    });
  }
};
