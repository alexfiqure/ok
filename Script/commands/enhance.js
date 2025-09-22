const axios = require("axios");

module.exports = {
  config: {
    name: "enhance",
    version: "1.1",
    hasPermission: 0,
    credits: "mahim islam",
    cooldowns: 5,
    description: "Upscale images to 4K resolution.",
    category: "image",
    usages: {
      en: "${pn} reply to an image to upscale it to 4K resolution."
    }
  };

  onStart: async function ({ message, event }) {
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      !event.messageReply.attachments[0] ||
      event.messageReply.attachments[0].type !== "photo"
    ) {
      return message.reply("📸 Please reply to an image to upscale it.");
    }

    const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
    const upscaleUrl = `https://aryan-xyz-upscale-api-phi.vercel.app/api/upscale-image?imageUrl=${imgurl}&apikey=ArYANAHMEDRUDRO`;

    message.reply("🔄 Processing your image, please wait...", async (err, info) => {
      try {
        const response = await axios.get(upscaleUrl);
        const imageUrl = response.data.resultImageUrl;
        const attachment = await global.utils.getStreamFromURL(imageUrl, "upscaled.png");

        message.reply({
          body: "✅ Your 4K upscaled image is ready!",
          attachment
        });

        message.unsend(info.messageID);
      } catch (error) {
        console.error("Upscale Error:", error.message);
        message.reply("❌ Error occurred while upscaling the image.");
      }
    });
  }
};
