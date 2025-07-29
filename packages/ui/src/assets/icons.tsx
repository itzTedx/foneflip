import { JSX, SVGProps } from "react";

export * from "./currency";

export const IconMenu = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      className="pointer-events-none"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 12L20 12"
        className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
      />
      <path
        d="M4 12H20"
        className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
      />
      <path
        d="M4 12H20"
        className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
      />
    </svg>
  );
};

export const IconProducts = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width="512"
      height="512"
    >
      <path d="M23.621,6.836l-1.352-2.826c-.349-.73-.99-1.296-1.758-1.552L14.214,.359c-1.428-.476-3-.476-4.428,0L3.49,2.458c-.769,.256-1.41,.823-1.759,1.554L.445,6.719c-.477,.792-.567,1.742-.247,2.609,.309,.84,.964,1.49,1.802,1.796l-.005,6.314c-.002,2.158,1.372,4.066,3.418,4.748l4.365,1.455c.714,.238,1.464,.357,2.214,.357s1.5-.119,2.214-.357l4.369-1.457c2.043-.681,3.417-2.585,3.419-4.739l.005-6.32c.846-.297,1.508-.946,1.819-1.79,.317-.858,.228-1.799-.198-2.499ZM10.419,2.257c1.02-.34,2.143-.34,3.162,0l4.248,1.416-5.822,1.95-5.834-1.95,4.246-1.415ZM2.204,7.666l1.327-2.782c.048,.025,7.057,2.373,7.057,2.373l-1.621,3.258c-.239,.398-.735,.582-1.173,.434l-5.081-1.693c-.297-.099-.53-.325-.639-.619-.109-.294-.078-.616,.129-.97Zm3.841,12.623c-1.228-.409-2.052-1.554-2.051-2.848l.005-5.648,3.162,1.054c1.344,.448,2.792-.087,3.559-1.371l.278-.557-.005,10.981c-.197-.04-.391-.091-.581-.155l-4.366-1.455Zm11.897-.001l-4.37,1.457c-.19,.063-.384,.115-.581,.155l.005-10.995,.319,.64c.556,.928,1.532,1.459,2.561,1.459,.319,0,.643-.051,.96-.157l3.161-1.053-.005,5.651c0,1.292-.826,2.435-2.052,2.844Zm4-11.644c-.105,.285-.331,.504-.619,.6l-5.118,1.706c-.438,.147-.934-.035-1.136-.365l-1.655-3.323s7.006-2.351,7.054-2.377l1.393,2.901c.157,.261,.186,.574,.081,.859Z" />
    </svg>
  );
};

export const IconDashboard = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      width="28"
      height="26"
      viewBox="0 0 28 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.3496 5.88324C15.3496 5.88324 9.23517 4.5237 6.37076 10.4335C3.50636 16.3434 8.54661 20.5884 8.54661 20.5884M22.0424 12.8474C22.0424 12.8474 22.7034 14.1514 21.7945 16.7595C20.8856 19.3676 19.8114 20.1168 19.8114 20.1168M14.8343 13.4937L20.2877 8.00003M7.47245 25H21.0233C21.0233 25 27 22.4474 27 14.4566C27 6.4659 20.7479 1 14.0275 1C7.3072 1 1 6.4104 1 14.1514C1 21.8925 7.47245 25 7.47245 25ZM15.1292 14.2624C15.1292 14.8907 14.6237 15.4 14 15.4C13.3763 15.4 12.8708 14.8907 12.8708 14.2624C12.8708 13.6342 13.3763 13.1249 14 13.1249C14.6237 13.1249 15.1292 13.6342 15.1292 14.2624Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const IconOrders = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      data-name="Layer 1"
      viewBox="0 0 24 24"
    >
      <path d="M22,14c0,.553-.448,1-1,1H6.737c.416,1.174,1.528,2,2.82,2h9.443c.552,0,1,.447,1,1s-.448,1-1,1H9.557c-2.535,0-4.67-1.898-4.966-4.415L3.215,2.884c-.059-.504-.486-.884-.993-.884H1c-.552,0-1-.447-1-1S.448,0,1,0h1.222c1.521,0,2.802,1.139,2.979,2.649l.041,.351h3.758c.552,0,1,.447,1,1s-.448,1-1,1h-3.522l.941,8h14.581c.552,0,1,.447,1,1Zm-15,6c-1.105,0-2,.895-2,2s.895,2,2,2,2-.895,2-2-.895-2-2-2Zm10,0c-1.105,0-2,.895-2,2s.895,2,2,2,2-.895,2-2-.895-2-2-2Zm2-14.414v-1.586c0-.553-.448-1-1-1s-1,.447-1,1v2c0,.266,.105,.52,.293,.707l1,1c.195,.195,.451,.293,.707,.293s.512-.098,.707-.293c.391-.391,.391-1.023,0-1.414l-.707-.707Zm5,.414c0,3.309-2.691,6-6,6s-6-2.691-6-6S14.691,0,18,0s6,2.691,6,6Zm-2,0c0-2.206-1.794-4-4-4s-4,1.794-4,4,1.794,4,4,4,4-1.794,4-4Z" />
    </svg>
  );
};

export const IconVendors = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      viewBox="0 0 24 24"
    >
      <path
        d="m23.978,16.306c-.137.959-.906,1.694-1.836,1.694h-.619c-1.026,0-1.857-.895-1.857-2,0,1.105-.831,2-1.857,2h-.619c-1.026,0-1.857-.895-1.857-2,0,1.105-.831,2-1.857,2h-.619c-.929,0-1.699-.735-1.836-1.694-.028-.199.018-.403.095-.589l.355-.861c.463-1.123,1.558-1.856,2.773-1.856h6.509c1.215,0,2.31.733,2.773,1.856l.355.861c.077.186.124.39.095.589Zm-1.978,2.694c-.553,0-1,.448-1,1v1c0,.551-.448,1-1,1h-5c-.552,0-1-.449-1-1v-1c0-.552-.447-1-1-1s-1,.448-1,1v1c0,1.654,1.346,3,3,3h5c1.654,0,3-1.346,3-3v-1c0-.552-.447-1-1-1ZM2,6C2,2.691,4.691,0,8,0s6,2.691,6,6-2.691,6-6,6-6-2.691-6-6Zm2,0c0,2.206,1.794,4,4,4s4-1.794,4-4-1.794-4-4-4-4,1.794-4,4Zm4,8C3.589,14,0,17.589,0,22v1c0,.552.447,1,1,1s1-.448,1-1v-1c0-3.309,2.691-6,6-6,.553,0,1-.448,1-1s-.447-1-1-1Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const IconUsers = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width="512"
      height="512"
    >
      <path d="M12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,12,10Zm6,13A6,6,0,0,0,6,23a1,1,0,0,0,2,0,4,4,0,0,1,8,0,1,1,0,0,0,2,0ZM18,8a4,4,0,1,1,4-4A4,4,0,0,1,18,8Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,18,2Zm6,13a6.006,6.006,0,0,0-6-6,1,1,0,0,0,0,2,4,4,0,0,1,4,4,1,1,0,0,0,2,0ZM6,8a4,4,0,1,1,4-4A4,4,0,0,1,6,8ZM6,2A2,2,0,1,0,8,4,2,2,0,0,0,6,2ZM2,15a4,4,0,0,1,4-4A1,1,0,0,0,6,9a6.006,6.006,0,0,0-6,6,1,1,0,0,0,2,0Z" />
    </svg>
  );
};

export const IconChevronDoubleRight = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      id="Outline"
      viewBox="0 0 24 24"
      width="512"
      height="512"
    >
      <path d="M13.1,19a1,1,0,0,1-.7-1.71L17,12.71a1,1,0,0,0,0-1.42L12.4,6.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0L18.4,9.88a3,3,0,0,1,0,4.24l-4.59,4.59A1,1,0,0,1,13.1,19Z" />
      <path d="M6.1,19a1,1,0,0,1-.7-1.71L10.69,12,5.4,6.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0l6,6a1,1,0,0,1,0,1.42l-6,6A1,1,0,0,1,6.1,19Z" />
    </svg>
  );
};

export const IconClock = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      height="18"
      width="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <polyline
          fill="none"
          points="9 4.75 9 9 12.25 11.25"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        ></polyline>
        <path
          d="M9,1.75c4.004,0,7.25,3.246,7.25,7.25s-3.246,7.25-7.25,7.25"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        ></path>
        <circle
          cx="3.873"
          cy="14.127"
          fill="currentColor"
          r=".75"
          stroke="none"
        ></circle>
        <circle
          cx="1.75"
          cy="9"
          fill="currentColor"
          r=".75"
          stroke="none"
        ></circle>
        <circle
          cx="3.873"
          cy="3.873"
          fill="currentColor"
          r=".75"
          stroke="none"
        ></circle>
        <circle
          cx="6.226"
          cy="15.698"
          fill="currentColor"
          r=".75"
          stroke="none"
        ></circle>
        <circle
          cx="2.302"
          cy="11.774"
          fill="currentColor"
          r=".75"
          stroke="none"
        ></circle>
        <circle
          cx="2.302"
          cy="6.226"
          fill="currentColor"
          r=".75"
          stroke="none"
        ></circle>
        <circle
          cx="6.226"
          cy="2.302"
          fill="currentColor"
          r=".75"
          stroke="none"
        ></circle>
      </g>
    </svg>
  );
};

export const IconDot = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      width="8"
      height="8"
      fill="currentColor"
      viewBox="0 0 8 8"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
};

export const IconFileEditFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21 15.2426V21.0082C21 21.556 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5511 3 20.9925V9H9C9.55228 9 10 8.55228 10 8V2H20.0017C20.5531 2 21 2.45531 21 2.9918V6.75736L12.0012 15.7562L11.995 19.995L16.2414 20.0012L21 15.2426ZM21.7782 8.80761L23.1924 10.2218L15.4142 18L13.9979 17.9979L14 16.5858L21.7782 8.80761ZM3 7L8 2.00318V7H3Z"></path>
    </svg>
  );
};

export const IconSettingsFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0932 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0932 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z"></path>
    </svg>
  );
};

export const IconInformationFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 9.5C12.8284 9.5 13.5 8.82843 13.5 8C13.5 7.17157 12.8284 6.5 12 6.5C11.1716 6.5 10.5 7.17157 10.5 8C10.5 8.82843 11.1716 9.5 12 9.5ZM14 15H13V10.5H10V12.5H11V15H10V17H14V15Z"></path>
    </svg>
  );
};

export const IconImageFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5 11.1005L7 9.1005L12.5 14.6005L16 11.1005L19 14.1005V5H5V11.1005ZM4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM15.5 10C14.6716 10 14 9.32843 14 8.5C14 7.67157 14.6716 7 15.5 7C16.3284 7 17 7.67157 17 8.5C17 9.32843 16.3284 10 15.5 10Z"></path>
    </svg>
  );
};

export const IconShoppingBasketFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M15.3709 3.44L18.5819 9.002L22.0049 9.00218V11.0022L20.8379 11.002L20.0813 20.0852C20.0381 20.6035 19.6048 21.0022 19.0847 21.0022H4.92502C4.40493 21.0022 3.97166 20.6035 3.92847 20.0852L3.17088 11.002L2.00488 11.0022V9.00218L5.42688 9.002L8.63886 3.44L10.3709 4.44L7.73688 9.002H16.2719L13.6389 4.44L15.3709 3.44ZM13.0049 13.0022H11.0049V17.0022H13.0049V13.0022ZM9.00488 13.0022H7.00488V17.0022H9.00488V13.0022ZM17.0049 13.0022H15.0049V17.0022H17.0049V13.0022Z"></path>
    </svg>
  );
};

export const IconGlobalFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM16.0043 12.8777C15.6589 12.3533 15.4097 11.9746 14.4622 12.1248C12.6717 12.409 12.4732 12.7224 12.3877 13.2375L12.3636 13.3943L12.3393 13.5597C12.2416 14.2428 12.2453 14.5012 12.5589 14.8308C13.8241 16.1582 14.582 17.115 14.8116 17.6746C14.9237 17.9484 15.2119 18.7751 15.0136 19.5927C16.2372 19.1066 17.3156 18.3332 18.1653 17.3559C18.2755 16.9821 18.3551 16.5166 18.3551 15.9518V15.8472C18.3551 14.9247 18.3551 14.504 17.7031 14.1314C17.428 13.9751 17.2227 13.881 17.0582 13.8064C16.691 13.6394 16.4479 13.5297 16.1198 13.0499C16.0807 12.9928 16.0425 12.9358 16.0043 12.8777ZM12 3.83333C9.68259 3.83333 7.59062 4.79858 6.1042 6.34896C6.28116 6.47186 6.43537 6.64453 6.54129 6.88256C6.74529 7.34029 6.74529 7.8112 6.74529 8.22764C6.74488 8.55621 6.74442 8.8672 6.84992 9.09302C6.99443 9.40134 7.6164 9.53227 8.16548 9.64736C8.36166 9.68867 8.56395 9.73083 8.74797 9.78176C9.25405 9.92233 9.64554 10.3765 9.95938 10.7412C10.0896 10.8931 10.2819 11.1163 10.3783 11.1717C10.4286 11.1356 10.59 10.9608 10.6699 10.6735C10.7307 10.4547 10.7134 10.2597 10.6239 10.1543C10.0648 9.49445 10.0952 8.2232 10.268 7.75495C10.5402 7.01606 11.3905 7.07058 12.012 7.11097C12.2438 7.12589 12.4626 7.14023 12.6257 7.11976C13.2482 7.04166 13.4396 6.09538 13.575 5.91C13.8671 5.50981 14.7607 4.9071 15.3158 4.53454C14.3025 4.08382 13.1805 3.83333 12 3.83333Z"></path>
    </svg>
  );
};

export const IconSaveFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M4 3H17L20.7071 6.70711C20.8946 6.89464 21 7.149 21 7.41421V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM12 18C13.6569 18 15 16.6569 15 15C15 13.3431 13.6569 12 12 12C10.3431 12 9 13.3431 9 15C9 16.6569 10.3431 18 12 18ZM5 5V9H15V5H5Z"></path>
    </svg>
  );
};

export const IconUnarchiveFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20 3L22 7V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V7.00353L4 3H20ZM12 10L8 14H11V18H13V14H16L12 10ZM18.764 5H5.236L4.237 7H19.764L18.764 5Z"></path>
    </svg>
  );
};

export const IconAddCircleFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11H7V13H11V17H13V13H17V11H13V7H11V11Z"></path>
    </svg>
  );
};

export const IconExportFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21 3H3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3ZM12 16C10.3431 16 9 14.6569 9 13H4V5H20V13H15C15 14.6569 13.6569 16 12 16ZM16 11H13V14H11V11H8L12 6.5L16 11Z"></path>
    </svg>
  );
};

export const IconHomeGearFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20ZM8.59208 13.808L7.60099 14.3802L8.6017 16.1133L9.5943 15.5402C9.98756 15.9116 10.467 16.193 10.9994 16.3512V17.4956H13.0007V16.3512C13.5331 16.1929 14.0125 15.9115 14.4057 15.5401L15.3984 16.1132L16.399 14.3801L15.4079 13.8078C15.4696 13.5478 15.5022 13.2766 15.5022 12.9978C15.5022 12.7189 15.4696 12.4477 15.4078 12.1877L16.399 11.6154L15.3983 9.88225L14.4056 10.4554C14.0124 10.084 13.533 9.80264 13.0006 9.64436V8.49998H10.9993V9.64436C10.4669 9.80265 9.98747 10.084 9.59421 10.4554L8.60164 9.88234L7.60099 11.6155L8.59205 12.1877C8.53034 12.4477 8.49768 12.7189 8.49768 12.9978C8.49768 13.2767 8.53035 13.5479 8.59208 13.808ZM12 14.4971C11.171 14.4971 10.499 13.8258 10.499 12.9978C10.499 12.1698 11.171 11.4985 12 11.4985C12.8289 11.4985 13.5009 12.1698 13.5009 12.9978C13.5009 13.8258 12.8289 14.4971 12 14.4971Z"></path>
    </svg>
  );
};

export const IconShieldUserFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M3.78307 2.82598L12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598ZM12 11C13.3807 11 14.5 9.88071 14.5 8.5C14.5 7.11929 13.3807 6 12 6C10.6193 6 9.5 7.11929 9.5 8.5C9.5 9.88071 10.6193 11 12 11ZM7.52746 16H16.4725C16.2238 13.75 14.3163 12 12 12C9.68372 12 7.77619 13.75 7.52746 16Z"></path>
    </svg>
  );
};

export const IconStoreFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M22 20V22H2V20H3V13.2422C1.79401 12.435 1 11.0602 1 9.5C1 8.67286 1.22443 7.87621 1.63322 7.19746L4.3453 2.5C4.52393 2.1906 4.85406 2 5.21132 2H18.7887C19.1459 2 19.4761 2.1906 19.6547 2.5L22.3575 7.18172C22.7756 7.87621 23 8.67286 23 9.5C23 11.0602 22.206 12.435 21 13.2422V20H22ZM5.78865 4L3.35598 8.21321C3.12409 8.59843 3 9.0389 3 9.5C3 10.8807 4.11929 12 5.5 12C6.53096 12 7.44467 11.3703 7.82179 10.4295C8.1574 9.59223 9.3426 9.59223 9.67821 10.4295C10.0553 11.3703 10.969 12 12 12C13.031 12 13.9447 11.3703 14.3218 10.4295C14.6574 9.59223 15.8426 9.59223 16.1782 10.4295C16.5553 11.3703 17.469 12 18.5 12C19.8807 12 21 10.8807 21 9.5C21 9.0389 20.8759 8.59843 20.6347 8.19746L18.2113 4H5.78865Z"></path>
    </svg>
  );
};

export const IconBankCardFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M22.0049 9.99979V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V9.99979H22.0049ZM22.0049 7.99979H2.00488V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V7.99979ZM15.0049 15.9998V17.9998H19.0049V15.9998H15.0049Z"></path>
    </svg>
  );
};

export const IconNotificationFilled = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M22 20H2V18H3V11.0314C3 6.04348 7.02944 2 12 2C16.9706 2 21 6.04348 21 11.0314V18H22V20ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z"></path>
    </svg>
  );
};
