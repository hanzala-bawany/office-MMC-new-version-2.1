// Local bundled image (e.g. import MMCLogo from "../../assets/MMC logo.png") ko
// canvas ke zariye base64 dataURL me convert karta he — jsPDF ko image embed
// karne ke liye base64 hi chahiye hota he, URL directly kaam nahi karta.
//
// Ye same-origin bundled asset use kar raha he isliye har device pe result
// hamesha identical rahega — koi screen-dependent rendering nahi ho rahi.
export const loadImageAsDataURL = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Logo image load nahi ho saka"));
    img.src = src;
  });