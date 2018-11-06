export class FeedbackCenterFinder {

    private baseDiv: HTMLElement;

    constructor(baseDiv: HTMLElement) {
        this.baseDiv = baseDiv;
    }

    public getHTML(): string {
        return `
        <div class="fm__mini_header fm__text fm__unselectable">Feedback</div>
        <div class="fm__body fm__invisible">
            <div class="fm__head fm__text fm__unselectable">Feedback Center</div>
            <div class="fm__hide"></div>

            <div class="fm__back fm__invisible"></div>

            <div class="fm__landing_area">
                <div class="fm__landing_area_or_text fm__text fm__unselectable">You can</div>
                <div class="fm__outerdiv">
                    <button class="fm__btn fm__btn_show_sending_area fm__unselectable">send new feedback</button>
                </div>
                <div class="fm__landing_area_or_text fm__text fm__unselectable">or</div>
                <div class="fm__outerdiv">
                    <button class="fm__btn fm__btn_show_viewing_area fm__unselectable">view submitted feedback</button>
                </div>

                <div class="fm__outerdiv fm__showalternative_areas fm__invisible">                   
                    <div class="fm__horizontal_line"></div>
                    <br />
                    <div class="fm__landing_area_or_text fm__text fm__unselectable">Alternatives detected!</div>
                    <br />
                    <button class="fm__btn fm__btn_showalternatives fm__unselectable">participate</button>                    
                </div>
            </div>

            <div class="fm__sending_area fm__invisible">
                <div class="fm__text fm__unselectable fm__outerdiv">Please fill in first before sending</div>
                <div class="fm__outerdiv">
                    <input class="fm__input_type_text fm__txt_contactName" type="text"
                    placeholder="Your name (optional)"></input>
                </div>
                <div class="fm__outerdiv">
                    <input class="fm__input_type_text fm__txt_contactEmail" type="text"
                    placeholder="Your contact email (optional)"></input>
                </div>
                <div class="fm__outerdiv fm__email_invalid fm__invisible fm__unselectable">please enter valid email</div>
                <div class="fm__outerdiv fm__paymentInfos">
                    <input class="fm__input_type_text fm__txt_iotaAddress" type="text" placeholder="Your IOTA address (optional)"></input>
                </div>
                <div class="fm__outerdiv fm__iotaAddress_invalid fm__invisible fm__unselectable">please enter valid IOTA address </div>
                <div class="fm__outerdiv">
                    <button class="fm__btn fm__btn_addAnnotation fm__unselectable">add new annotation</button>
                    <button class="fm__btn fm__btn_sendselection fm__unselectable">send selected alternatives</button>
                </div>
                <div class="fm__outerdiv fm__sendbtn_and_public_checkbox fm__invisible">
                    <label class="fm__checkbox_ispublic_container">
                        <input type="checkbox" class="fm__checkbox fm__checkbox_ispublic" />
                        <span class="fm__text fm__unselectable">public viewable</span>
                    </label>
                    <button class="fm__btn fm__btn_send fm__unselectable">send</button>
                </div>
                <div class="fm__outerdiv">
                    <div class="fm__spinner fm__spinner_send fm__invisible"></div>
                </div>
            </div>

            <div class="fm__viewing_area fm__invisible">
                <div class="fm__outerdiv fm__ticketStorageExists fm__invisible">
                    <div class="fm__text fm__unselectable">Choose an entry, to see already sub-<br/>mitted feedback from this device </div>
                    <div>
                        <select class="fm__select fm__select_ticketID">
                            <option>Choose entry</option>
                        </select>
                    </div>
                    
                    <div class="fm__spinner fm__spinner_select fm__invisible"></div>
                                            
                    <div class="fm__horizontal_line"></div>
                </div>

                <div class="fm__text fm__unselectable fm__outerdiv">Enter a specific ticket-ID, to see <br/> already submitted feedback </div>
                <div class="fm__outerdiv">
                    <input class="fm__input_type_text fm__txt_ticketViewID" type="text" placeholder="Enter ticket-ID"></input> 
                </div>
                <div class="fm__outerdiv">
                    <button class="fm__btn fm__btn_show fm__unselectable">show submission</button>
                </div>
                <div class="fm__outerdiv">
                    <div class="fm__spinner fm__spinner_showsubmission fm__invisible"></div>
                </div>
                <div class="fm__outerdiv">
                    <div class="fm__horizontal_line"></div>
                    <button class="fm__btn fm__btn_show_public fm__unselectable">show public submissions</button>
                </div>
                <div class="fm__outerdiv">
                    <div class="fm__spinner fm__spinner_show_publicsubmissions fm__invisible"></div>
                </div>
            </div>

            <div class="fm__comparison_area fm__invisible">
                <div class="fm__outerdiv">                        

                    <button class="fm__btn fm__btn_delete_ticket_from_storage fm__unselectable fm__invisible">delete from browser storage</button>

                    <!-- Public viewable infos -->
                    <table class="fm__table">
                        <tr>
                            <td class="fm__table_firstcolumn fm__text fm__unselectable">Guid:</td>
                            <td class="fm__comparison_guid_text fm__table_secondcolumn fm__text fm__text_dont_break_out"></td>                               
                        </tr>                          
                        <tr>
                            <td class="fm__table_firstcolumn fm__text fm__unselectable">Public:</td>
                            <td class="fm__comparison_public_text fm__table_secondcolumn fm__text fm__unselectable"></td>                               
                        </tr>
                        <tr>
                            <td class="fm__table_firstcolumn fm__text fm__unselectable">Sent:</td>
                            <td class="fm__comparison_sentat_text fm__table_secondcolumn fm__text"></td>                               
                        </tr>
                        <tr>
                            <td class="fm__table_firstcolumn fm__text fm__unselectable">Viewed:</td>
                            <td class="fm__comparison_viewedat_text fm__table_secondcolumn fm__text"></td>                               
                        </tr>
                        <tr>
                            <td class="fm__table_firstcolumn fm__text fm__unselectable">Items:</td>
                            <td class="fm__comparison_annotationscount_text fm__table_secondcolumn fm__text fm__unselectable"></td>                               
                        </tr>
                    </table>

                    <!-- Private viewable infos -->
                    <table class="fm__table fm__table_private_ticketinfos">
                        <tr>
                            <td class="fm__table_firstcolumn fm__text fm__unselectable">Name:</td>
                            <td class="fm__comparison_name_text fm__table_secondcolumn fm__text fm__text_dont_break_out"></td>                               
                        </tr>
                        <tr>
                            <td class="fm__table_firstcolumn fm__text fm__unselectable">Email:</td>
                            <td class="fm__comparison_email_text fm__table_secondcolumn fm__text fm__text_dont_break_out"></td>                               
                        </tr>
                        <tr>
                            <td class="fm__table_firstcolumn fm__text fm__unselectable">IOTA address:</td>
                            <td class="fm__comparison_iotaaddress_text fm__table_secondcolumn fm__text fm__text_dont_break_out"></td>                               
                        </tr>
                    </table>

                    <div class="fm__comparison_row fm__comparison_row_firstline">
                        <div class="fm__comparison_column fm__comparison_column_firstline fm__text fm__unselectable">Ticket settings</div>
                        <div class="fm__comparison_column fm__comparison_column_firstline fm__text fm__unselectable">Local settings</div>
                    </div>
                    <div class="fm__comparison_text fm__text fm__unselectable">Please adjust the red properties, a <br />change of browser zoom can help.</div>
                    <div class="fm__comparison_line_header fm__text fm__unselectable">Window dimensions</div>
                    <div class="fm__comparison_row">
                        <div class="fm__comparison_column fm__comparison_windowdimension_ticket fm__text fm__unselectable"></div>
                        <div class="fm__comparison_column fm__text fm__unselectable"><span class="fm__comparison_windowdimension_local_width"></span> x <span class="fm__comparison_windowdimension_local_height"></span></div>
                    </div>
                    <div class="fm__comparison_line_header fm__text fm__unselectable">Browser</div>
                    <div class="fm__comparison_row">
                        <div class="fm__comparison_column fm__comparison_browser_ticket fm__text fm__unselectable"></div>
                        <div class="fm__comparison_column fm__comparison_browser_local fm__text fm__unselectable"></div>
                    </div>
                    <div class="fm__comparison_line_header fm__text fm__unselectable">Browser font-size</div>
                    <div class="fm__comparison_row">
                        <div class="fm__comparison_column fm__comparison_browserfontsize_ticket fm__text fm__unselectable"></div>
                        <div class="fm__comparison_column fm__comparison_browserfontsize_local fm__text fm__unselectable"></div>
                    </div>
                </div>
            </div>
        </div>
        `;

    }

    public getBodyDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__body");
    }

    public getShowSendingAreaButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_show_sending_area");
    }

    public getShowViewingAreaButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_show_viewing_area");
    }

    public getShowAlternativeAreasDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__showalternative_areas");
    }

    public getShowAlternativesButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_showalternatives");
    }

    public getAddAnnotationButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_addAnnotation");
    }

    public getSendSelectionButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_sendselection");
    }

    public getMiniHeaderDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__mini_header");
    }

    public getHeadDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__head");
    }

    public getHideDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__hide");
    }

    public getBackDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__back");
    }

    public getLandingAreaDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__landing_area");
    }

    public getSendingAreaDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__sending_area");
    }

    public getViewingAreaDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__viewing_area");
    }

    public getNameInput() {
        return this.getFirstByClassName<HTMLInputElement>("fm__txt_contactName");
    }

    public getEmailInput() {
        return this.getFirstByClassName<HTMLInputElement>("fm__txt_contactEmail");
    }

    public getEmailInvalidDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__email_invalid");
    }

    public getPaymentInfosDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__paymentInfos");
    }

    public getIOTAAddressInput() {
        return this.getFirstByClassName<HTMLInputElement>("fm__txt_iotaAddress");
    }

    public getIOTAAddressInvalidDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__iotaAddress_invalid");
    }

    public getSendButtonAndPublicCheckboxDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__sendbtn_and_public_checkbox");
    }

    public getIsPublicCheckbox() {
        return this.getFirstByClassName<HTMLInputElement>("fm__checkbox_ispublic");
    }

    public getSendButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_send");
    }

    public getTicketStorageExistsDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__ticketStorageExists");
    }

    public getTicketViewIDInput() {
        return this.getFirstByClassName<HTMLInputElement>("fm__txt_ticketViewID");
    }

    public getShowButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_show");
    }

    public getShowPublicButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_show_public");
    }

    public getSpinnerSendDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__spinner_send");
    }

    public getSpinnerSelectDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__spinner_select");
    }

    public getSpinnerShowSubmissionDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__spinner_showsubmission");
    }

    public getSpinnerShowPublicSubmissionsDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__spinner_show_publicsubmissions");
    }

    public getTicketIDSelect() {
        return this.getFirstByClassName<HTMLSelectElement>("fm__select_ticketID");
    }

    //#region Comparison-Area

    public getAreaDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__comparison_area");
    }

    public getDeleteFromStorageButton() {
        return this.getFirstByClassName<HTMLButtonElement>("fm__btn_delete_ticket_from_storage");
    }

    public getGuidTD() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__comparison_guid_text");
    }

    public getPublicTD() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__comparison_public_text");
    }

    public getSentAtTD() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__comparison_sentat_text");
    }

    public getViewedAtTD() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__comparison_viewedat_text");
    }

    public getAnnotationsCountTD() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__comparison_annotationscount_text");
    }

    public getNameTD() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__comparison_name_text");
    }

    public getEmailTD() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__comparison_email_text");
    }

    public getIOTAAddressTD() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__comparison_iotaaddress_text");
    }

    public getPrivateTicketInfosTable() {
        return this.getFirstByClassName<HTMLTableDataCellElement>("fm__table_private_ticketinfos");
    }

    public getWindowDimensionTicketDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__comparison_windowdimension_ticket");
    }

    public getWindowDimensionLocalWidthDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__comparison_windowdimension_local_width");
    }

    public getWindowDimensionLocalHeightDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__comparison_windowdimension_local_height");
    }

    public getBrowserTicketDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__comparison_browser_ticket");
    }

    public getBrowserLocalDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__comparison_browser_local");
    }

    public getBrowserFontSizeTicketDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__comparison_browserfontsize_ticket");
    }

    public getBrowserFontSizeLocalDiv() {
        return this.getFirstByClassName<HTMLDivElement>("fm__comparison_browserfontsize_local");
    }

    //#endregion

    public getFirstByClassName<T extends HTMLElement>(className: string): T {
        return this.baseDiv.getElementsByClassName(className)[0] as T;
    }
}
