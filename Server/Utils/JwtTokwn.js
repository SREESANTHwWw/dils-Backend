const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken({
    id: user._id, 
    username: user.username,
    type: user.type
  });
  //options for Cookies

  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, user: { id: user._id,
        username: user.username,
        shopname: user.shopname,
        owner: user.owner,
        phonenumber: user.phonenumber,
        address: user.address,
        gstno: user.gstno,
        pincode: user.pincode,
        city: user.city,
        whatsappno: user.whatsappno,
        stateid: user.stateid,
        type: user.type,}, token });
};

module.exports = sendToken;
