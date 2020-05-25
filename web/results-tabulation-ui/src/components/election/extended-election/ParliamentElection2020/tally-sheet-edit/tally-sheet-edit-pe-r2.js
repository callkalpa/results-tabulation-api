import React, {useState} from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TextField from '@material-ui/core/TextField';

import {isNumeric, processNumericValue, sum} from "../../../../../utils";
import Processing from "../../../../processing";
import {useTallySheetEdit} from "../../../../tally-sheet/tally-sheet-edit";
import {
    TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED,
    TALLY_SHEET_ROW_TYPE_DRAFT_BONUS_SEATS_ALLOCATED,
    TALLY_SHEET_ROW_TYPE_DRAFT_SEATS_ALLOCATED_FROM_ROUND_2, TALLY_SHEET_ROW_TYPE_ELECTED_CANDIDATE,
    TALLY_SHEET_ROW_TYPE_MINIMUM_VALID_VOTE_COUNT_REQUIRED_FOR_SEAT_ALLOCATION, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED,
    TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_1,
    TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2, TALLY_SHEET_ROW_TYPE_VALID_VOTE_COUNT_CEIL_PER_SEAT,
    TALLY_SHEET_ROW_TYPE_VALID_VOTES_REMAIN_FROM_ROUND_1
} from "../TALLY_SHEET_ROW_TYPE";

export default function TallySheetEdit_PE_R2({history, queryString, election, tallySheet, messages}) {

    const {parties, metaDataMap} = election;
    let {numberOfSeatsAllocated} = metaDataMap;
    numberOfSeatsAllocated = parseInt(numberOfSeatsAllocated);

    const [tallySheetRows, setTallySheetRows] = useState({
        [TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_1]: {
            templateRow: {}, map: {}
        },
        [TALLY_SHEET_ROW_TYPE_VALID_VOTES_REMAIN_FROM_ROUND_1]: {
            templateRow: {}, map: {}
        },
        [TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2]: {
            templateRow: {}, map: {}
        },
        [TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED]: {
            templateRow: {}, map: {}
        },
        [TALLY_SHEET_ROW_TYPE_DRAFT_SEATS_ALLOCATED_FROM_ROUND_2]: {
            templateRow: {}, map: {}
        },
        [TALLY_SHEET_ROW_TYPE_DRAFT_BONUS_SEATS_ALLOCATED]: {
            templateRow: {}, map: {}
        },
        [TALLY_SHEET_ROW_TYPE_MINIMUM_VALID_VOTE_COUNT_REQUIRED_FOR_SEAT_ALLOCATION]: {
            templateRow: {}, map: {}
        },
        [TALLY_SHEET_ROW_TYPE_VALID_VOTE_COUNT_CEIL_PER_SEAT]: {
            templateRow: {}, map: {}
        },
        [TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED]: {
            templateRow: {}, map: {}
        }
    });

    function getNumericValueDiffHelperText(numFrom, numTo) {
        if (!isNumeric(numTo)) {
            return [true, "Only numeric values are valid"];
        } else if (numFrom !== numTo) {
            return [false, `Changed ${numFrom} to ${numTo}`];
        }

        return [false, ""];
    }

    /**
     * Each function returns an array of two values.
     * [error: boolean, helperText: string]
     */
    const helperTextMap = {
        [TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED]: (partyId) => {
            const bonusSeatsAllocated = getValue(partyId, TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED, "numValue");
            const bonusSeatsAllocatedDraft = getValue(partyId, TALLY_SHEET_ROW_TYPE_DRAFT_BONUS_SEATS_ALLOCATED, "numValue");

            return getNumericValueDiffHelperText(bonusSeatsAllocatedDraft, bonusSeatsAllocated);
        },
        [TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2]: (partyId) => {
            const seatsAllocatedFromSecondRound = getValue(partyId, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2, "numValue");
            const seatsAllocatedFromSecondRoundDraft = getValue(partyId, TALLY_SHEET_ROW_TYPE_DRAFT_SEATS_ALLOCATED_FROM_ROUND_2, "numValue");

            return getNumericValueDiffHelperText(seatsAllocatedFromSecondRoundDraft, seatsAllocatedFromSecondRound);
        }
    };

    const getHelperTextMethod = (templateRowType) => {
        return helperTextMap[templateRowType];
    };

    const _forEachParty = (callback) => {
        for (let partyIndex = 0; partyIndex < parties.length; partyIndex++) {
            const party = parties[partyIndex];
            callback(party);
        }
    };

    const getTallySheetRow = (key, templateRowType) => {
        if (tallySheetRows[templateRowType] && tallySheetRows[templateRowType].map && tallySheetRows[templateRowType].map[key]) {
            return tallySheetRows[templateRowType].map[key];
        }

        return null
    };

    const setValue = (key, templateRowType, valuePropertyName = "numValue", value) => {
        setTallySheetRows((tallySheetRows) => {
            tallySheetRows = {...tallySheetRows};
            Object.assign(tallySheetRows[templateRowType].map[key], {[valuePropertyName]: processNumericValue(value)});

            return tallySheetRows;
        });
    };

    const getValue = (key, templateRowType, valuePropertyName = "numValue") => {
        const tallySheetRow = getTallySheetRow(key, templateRowType);
        if (tallySheetRow) {
            return tallySheetRow[valuePropertyName];
        }

        return 0;
    };

    const handleValueChange = (key, templateRowType, valuePropertyName = "numValue") => event => {
        const {value} = event.target;

        setValue(key, templateRowType, valuePropertyName, value);
    };


    const setTallySheetContent = async (tallySheetVersion) => {

        const _tallySheetRows = {...tallySheetRows};

        // Get the `templateRow` assigned to each type of tally sheet rows.
        tallySheet.template.rows.map(((templateRow) => {
            if (_tallySheetRows[templateRow.templateRowType]) {
                Object.assign(_tallySheetRows[templateRow.templateRowType].templateRow, templateRow)
            }
        }));

        // TODO append default values. For PE-R2, it could be assumed that the content always has valid data

        if (tallySheetVersion) {
            const {content} = tallySheetVersion;

            for (let i = 0; i < content.length; i++) {
                let contentRow = content[i];

                if (_tallySheetRows[contentRow.templateRowType]) {
                    _tallySheetRows[contentRow.templateRowType].map[contentRow.partyId] = contentRow;
                }
            }
        }

        setTallySheetRows(_tallySheetRows);
    };

    const validateTallySheetContent = () => {
        const tallySheetRowTypesToBeValidated = [
            TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2,
            TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED
        ];

        for (let i = 0; i < tallySheetRowTypesToBeValidated.length; i++) {
            const tallySheetRowType = tallySheetRowTypesToBeValidated[i];
            for (let j = 0; j < parties.length; j++) {
                const party = parties[j];
                const {partyId} = party;
                const [error] = getHelperTextMethod(tallySheetRowType)(partyId);

                if (error) {
                    return false;
                }
            }
        }

        // Check the total seats allocation against the gazetted seat allocation.
        const totalSeatsAllocated = getTotalSeatAllocated();
        if (totalSeatsAllocated !== numberOfSeatsAllocated) {
            return false
        }

        return true;
    };

    const getTallySheetRequestBody = () => {
        const content = [];

        [
            TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_1,
            TALLY_SHEET_ROW_TYPE_VALID_VOTES_REMAIN_FROM_ROUND_1,
            TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2,
            TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED,
            TALLY_SHEET_ROW_TYPE_DRAFT_SEATS_ALLOCATED_FROM_ROUND_2,
            TALLY_SHEET_ROW_TYPE_DRAFT_BONUS_SEATS_ALLOCATED,
            TALLY_SHEET_ROW_TYPE_MINIMUM_VALID_VOTE_COUNT_REQUIRED_FOR_SEAT_ALLOCATION,
            TALLY_SHEET_ROW_TYPE_VALID_VOTE_COUNT_CEIL_PER_SEAT,
            TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED
        ].map((templateRowType) => {
            _forEachParty((party) => {
                const {partyId} = party;
                const tallySheetRow = getTallySheetRow(partyId, templateRowType);
                if (tallySheetRow) {
                    content.push(tallySheetRow);
                }
            });
        });

        return {
            content: content
        };
    };

    function getTotalSeatAllocated() {
        let totalSeatsAllocated = 0;
        _forEachParty((party) => {
            const {partyName, partyId} = party;
            const seatsAllocatedFromRound1 = getValue(partyId, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_1, "numValue");
            const seatsAllocatedFromRound2 = getValue(partyId, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2, "numValue");
            const bonusSeatsAllocated = getValue(partyId, TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED, "numValue");
            const seatsAllocated = sum([seatsAllocatedFromRound1, bonusSeatsAllocated, seatsAllocatedFromRound2], true);
            totalSeatsAllocated += seatsAllocated;
        });

        return totalSeatsAllocated;
    }

    const {processing, processingLabel, saved, getActionsBar} = useTallySheetEdit({
        messages,
        history,
        election,
        tallySheet,
        setTallySheetContent,
        validateTallySheetContent,
        getTallySheetRequestBody
    });


    function getTallySheetEditForm() {
        const {parties} = election;
        const totalSeatsAllocated = getTotalSeatAllocated();

        if (saved) {

            return <Table aria-label="simple table" size={saved ? "small" : "medium"}>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Party</TableCell>
                        <TableCell align="center">Seats Allocated From Round 1</TableCell>
                        <TableCell align="center">Bonus Seats Allocated</TableCell>
                        <TableCell align="center">Seats Allocated From Round 2</TableCell>
                        <TableCell align="center">Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {parties.map((party) => {
                        const {partyName, partyId} = party;
                        const seatsAllocatedFromRound1 = getValue(partyId, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_1, "numValue");
                        const seatsAllocatedFromRound2 = getValue(partyId, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2, "numValue");
                        const bonusSeatsAllocated = getValue(partyId, TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED, "numValue");
                        const seatsAllocated = sum([seatsAllocatedFromRound1, bonusSeatsAllocated, seatsAllocatedFromRound2], true);

                        return <TableRow key={partyId}>
                            <TableCell align="center">
                                {partyName}
                            </TableCell>
                            <TableCell align="center">
                                {seatsAllocatedFromRound1}
                            </TableCell>
                            <TableCell align="center">
                                {bonusSeatsAllocated}
                            </TableCell>
                            <TableCell align="center">
                                {seatsAllocatedFromRound2}
                            </TableCell>
                            <TableCell align="center">
                                {seatsAllocated}
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TableCell align="right" colSpan={5}>
                            {getActionsBar()}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        } else if (!processing) {

            return <Table aria-label="simple table" size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Party</TableCell>
                        <TableCell align="center">Seats Allocated From Round 1</TableCell>
                        <TableCell align="center">Bonus Seats Allocated</TableCell>
                        <TableCell align="center">Seats Allocated From Round 2</TableCell>
                        <TableCell align="center">Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>

                    {parties.map((party) => {
                        const {partyName, partyId} = party;
                        const seatsAllocatedFromRound1 = getValue(partyId, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_1, "numValue");
                        const seatsAllocatedFromRound2 = getValue(partyId, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2, "numValue");
                        const bonusSeatsAllocated = getValue(partyId, TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED, "numValue");
                        const seatsAllocated = sum([seatsAllocatedFromRound1, bonusSeatsAllocated, seatsAllocatedFromRound2], true);

                        const [bonusSeatsAllocatedError, bonusSeatsAllocatedHelperText] = getHelperTextMethod(TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED)(partyId);
                        const [seatsAllocatedFromRound2Error, seatsAllocatedFromRound2HelperText] = getHelperTextMethod(TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2)(partyId);

                        return <TableRow key={partyId}>

                            <TableCell align="center">
                                {partyName}
                            </TableCell>
                            <TableCell align="center">
                                {seatsAllocatedFromRound1}
                            </TableCell>
                            <TableCell align="center">
                                <TextField
                                    required
                                    variant="outlined"
                                    error={bonusSeatsAllocatedError}
                                    helperText={bonusSeatsAllocatedHelperText}
                                    value={bonusSeatsAllocated}
                                    size="small"
                                    margin="normal"
                                    onChange={handleValueChange(partyId, TALLY_SHEET_ROW_TYPE_BONUS_SEATS_ALLOCATED, "numValue")}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <TextField
                                    required
                                    variant="outlined"
                                    error={seatsAllocatedFromRound2Error}
                                    helperText={seatsAllocatedFromRound2HelperText}
                                    value={seatsAllocatedFromRound2}
                                    size="small"
                                    margin="normal"
                                    onChange={handleValueChange(partyId, TALLY_SHEET_ROW_TYPE_SEATS_ALLOCATED_FROM_ROUND_2, "numValue")}
                                />
                            </TableCell>
                            <TableCell align="center">
                                {seatsAllocated}
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TableCell align="right" colSpan={4}>
                            Total seats allocation
                        </TableCell>
                        <TableCell align="center">
                            <TextField
                                required
                                variant="outlined"
                                error={totalSeatsAllocated !== numberOfSeatsAllocated}
                                helperText={`Total seats count should be ${numberOfSeatsAllocated}`}
                                value={totalSeatsAllocated}
                                size="small"
                                margin="normal"
                                disabled={true}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="right" colSpan={5}>
                            {getActionsBar()}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        } else {
            return null;
        }
    }

    return <Processing showProgress={processing} label={processingLabel}>
        {getTallySheetEditForm()}
    </Processing>;
}
