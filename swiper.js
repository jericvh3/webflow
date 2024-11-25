<!-- Start of swiper.js code -->
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>

<script>
$(".swiper-js").each(function () {
  const loopMode = $(this).attr("loop-mode") === "true";
  const centeredSlides = $(this).attr("centered-slides") === "true";
  const sliderDuration = +($(this).attr("slider-duration")) || 300;
  const autoplayEnabled = $(this).attr("slider-autoplay") === "true";
  const autoplayDelay = parseInt($(this).attr("slider-autoplay-delay")) || 2500;
  const autoplaySpeed = parseInt($(this).attr("slider-autoplay-speed")) || 1000;
  const resistanceRatio = +($(this).attr("resistance-ratio")) || 0;
  const followFingerEnabled = $(this).attr("follow-finger") !== "false";
  const freeModeEnabled = $(this).attr("free-mode") === "true";
  const draggableEnabled = $(this).attr("draggable") === "true";
  const hideArrows = $(this).attr("hide-arrows") === "true"; // New attribute

  const swiper = new Swiper($(this).find(".swiper")[0], {
    loop: loopMode,
    autoHeight: true,
    centeredSlides: centeredSlides,
    followFinger: followFingerEnabled,
    freeMode: freeModeEnabled,
    slidesPerView: 'auto',
    spaceBetween: 0,
    mousewheel: { forceToAxis: true },
    keyboard: { enabled: true, onlyInViewport: true },
    autoplay: { enabled: autoplayEnabled, delay: autoplayDelay, disableOnInteraction: false },
    speed: autoplaySpeed,
    resistanceRatio: resistanceRatio,
    simulateTouch: draggableEnabled,
    allowTouchMove: true,

    breakpoints: {
      480: { slidesPerView: 'auto', spaceBetween: 0 },
      768: { slidesPerView: 'auto', spaceBetween: 0 },
      992: { slidesPerView: 'auto', spaceBetween: 0 }
    },

    pagination: {
      el: $(this).find(".swiper-bullet-wrapper")[0],
      bulletActiveClass: "is-active",
      bulletClass: "swiper-bullet",
      bulletElement: "button",
      clickable: true
    },

    navigation: {
      nextEl: $(this).find(".swiper-button-next")[0],
      prevEl: $(this).find(".swiper-button-prev")[0],
    },

    slideActiveClass: "is-active",
    slideDuplicateActiveClass: "is-active",

    on: {
      slideChange: function () {
        const swiperInstance = this;
        const isBeginning = swiperInstance.isBeginning;
        const isEnd = swiperInstance.isEnd;

        // Hide/Show navigation arrows based on whether it's the beginning or end
        if (hideArrows) {
          if (isBeginning) {
            $(swiperInstance.params.navigation.prevEl).hide();
          } else {
            $(swiperInstance.params.navigation.prevEl).show();
          }

          if (isEnd) {
            $(swiperInstance.params.navigation.nextEl).hide();
          } else {
            $(swiperInstance.params.navigation.nextEl).show();
          }
        }
      }
    }
  });

  /* Pop-up Swiper */
  const modalSwiper = new Swiper('#pop-up-swiper', {
    spaceBetween: 30,
    allowTouchMove: false,
    speed: 0,
    slidesPerView: 1,
    centeredSlides: true,
    loop: true,
    slidesPerGroup: 1,
  });

  /* Use this code to target the current slide in pop-up, add swiper slide class from the main slider */
  $('.lab-toolkit-slide').click(function () {
    var index = $(this).index() + 1;
    modalSwiper.slideTo(index);
  });
    $('.whoweare-team-swiper-slide').click(function () {
    var index = $(this).index() + 1;
    modalSwiper.slideTo(index);
  });
});
</script>
<!-- End of swiper.js code -->
