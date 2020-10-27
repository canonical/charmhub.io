import Swiper, { Navigation, Pagination } from "swiper";
import "swiper/swiper-bundle.css";

const init = () => {
  Swiper.use([Navigation, Pagination]);

  const swiper = new Swiper(".swiper-container", {
    pagination: {
      el: ".swiper-pagination",
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
};

export { init };
