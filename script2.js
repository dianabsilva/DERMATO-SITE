const swiper = new Swiper('.wrapper', {
    slidesPerView: 'auto',
    loop: true,
    spaceBetween: 30,

    autoplay:{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },
  
    //Pagination
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // Responsive breakpoints
    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        }
    }
  });