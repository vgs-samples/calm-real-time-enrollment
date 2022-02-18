const selector = (element) => document.querySelector(element);
const hiddenSpinner = selector(".hidden");
const submitButton = selector('.form-button');


const BUTTON_STATE_DEFAULT = {
  updateContent: "<i aria-label=\"icon: loading\" size=\"10\" class=\"anticon spinner hidden anticon-loading tw-mx-auto tw-my-0\"> </i>" +
      "Submit",
  status: 'default',
};


const BUTTON_STATE_UPDATING_CARD = {
  updateContent: "<i aria-label=\"icon: loading\" size=\"120\" class=\"anticon anticon-loading tw-mx-auto tw-my-0\"> </i>" +
      "UPDATING CARD...",
  status: 'updating',
};


const HIDDEN_CLASS = 'hidden';
const CARD_HEADER_TEMPLATE = `
   <div class="updated-card__title mt-10 lg:mt-0">
     <h4>Updated card</h4>
   </div>
`;


const updateCardDOM = (block, isLoading) => {
    const updatedCard = document.querySelector('.updated-card');
    const cardContentContainer = updatedCard.querySelector('.card-content-container');
    const retrievingSpinner = updatedCard.querySelector('.retrieving');

    if (retrievingSpinner) {
       retrievingSpinner.classList[isLoading ? 'remove' : 'add'](HIDDEN_CLASS);
    }
    if (updatedCard) {
        cardContentContainer.innerHTML = block;
    }
};


function updateSubmitButton({updateContent, status}) {
    submitButton.innerHTML = updateContent;
    const updatedButtonStatus = status;
    updatedButtonStatus === 'default'
        ? hiddenSpinner.classList.remove("hidden")
        : hiddenSpinner.classList.add("hidden")
};


export const formatCardNumber = value => {
  const regex = /^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/g
  const onlyNumbers = value.replace(/[^\d]/g, '')

  return onlyNumbers.replace(regex, (regex, $1, $2, $3, $4) =>
    [$1, $2, $3, $4].filter(group => !!group).join(' ')
  )
}


export const updateSuccessfulCard = (res) => {
    const { exp_month, exp_year, number, name, id, token = ''} = res;
    if (token && id && !localStorage.getItem(token)) {
        localStorage.setItem(token, JSON.stringify(res))
    }
    // format card number for convenience
    const outputNumber = formatCardNumber(number);
    // injected markup
    const CARD_SUCCESS_CONTENT = `
    ${CARD_HEADER_TEMPLATE}
    <div class="card-body updated p-4">
       <div class="redacted-card__header">
          <div class="card-chip__block">
             <img src="/static/account_updater/assests/card-chip.svg" alt="">
          </div>
          <img src="/static/account_updater/assests/nfc-logo.svg" alt="">
       </div>
           <div class="redacted-card__main">
       <span class="redacted-card-value">${outputNumber}</span>
    </div>
    <div class="redacted-card__footer">
       <div class="card-data__item">
          <div class="card-item__title">
             Name on card
          </div>
          <div class="card-item__info">
             ${name}
          </div>
       </div>
       <div class="card-data__item">
          <div class="card-item__title">
             Expiration
          </div>
          <div class="card-item__info">
             ${exp_month}/${exp_year}
          </div>
       </div>
       <div class="card-data__item">
          <div class="card-item__img">
             <img src="/static/account_updater/assests/mastercard-logo.svg" alt="">
          </div>
       </div>
      </div>
    </div>
    </div>
    `
    updateCardDOM(CARD_SUCCESS_CONTENT, false);
    updateSubmitButton(BUTTON_STATE_DEFAULT);
};


export const updateFailedCard = (data) => {
    const CARD_FAILED_CONTENT = `
      ${CARD_HEADER_TEMPLATE}
      <div class="card-body updated  collect-form-body">
        <div class="updated-wrapper collect-form-body">
          <div class="message-wrapper failed">
            <div>
              <h4 class="error-title">Error!</h4>
            </div>
            <span class="status-message">${data?.errors[0]?.detail || ''}</span>
          </div>
        </div>
      </div>
    `;
    updateCardDOM(CARD_FAILED_CONTENT, false);
    updateSubmitButton(BUTTON_STATE_DEFAULT);
};

export const retrievingCard = () => {
    updateCardDOM(CARD_HEADER_TEMPLATE, true)
    updateSubmitButton(BUTTON_STATE_UPDATING_CARD);
};
