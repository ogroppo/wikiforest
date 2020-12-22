import getClaimIds, { checkIfClaimsHasSeriesOrdinal } from "./getClaimIds";
import {
  SIBLINGS_ID,
  SPOUSE_ID,
  START_DATE_ID,
  NUMBER_OF_CHILDREN_ID,
  PARTNER_ID,
} from "../constants/properties";
import getSimpleClaimValue from "./getSimpleClaimValue";

export default function addEntityConnectors(entity, propId, options = {}) {
  if (options.upMap) {
    if (!propId) throw new Error("propId needed");
    entity.upIds = options.upMap[entity.id];
  } else {
    delete entity.upIds;
  }

  if (options.addDownIds) {
    if (!propId) throw new Error("propId needed");
    entity.downIds = getClaimIds(entity, propId);
    entity.downIdsAlreadySorted = checkIfClaimsHasSeriesOrdinal(entity, propId);
    console.log(entity.downIdsAlreadySorted);
    //use number of children property, use count of children if not available
    entity.childrenCount =
      getSimpleClaimValue(entity.simpleClaims, NUMBER_OF_CHILDREN_ID) ||
      entity.downIds.length;
  } else {
    delete entity.downIds;
  }

  if (options.addRightIds) addRightIds(entity, options);
  else {
    delete entity.rightIds;
  }
  if (options.addLeftIds) entity.leftIds = getClaimIds(entity, SIBLINGS_ID);
  else delete entity.leftIds;
}

function addRightIds(entity, options) {
  let claim = [];
  console.log(options.rightEntityType);
  if (options.rightEntityType === "Spouses and partners") {
    claim = (entity.claims[SPOUSE_ID] || []).concat(
      entity.claims[PARTNER_ID] || []
    ); //cannot use simpleclaims here as only preferred will show up
    console.log(claim);
  } else if (options.rightEntityType === "Only spouses") {
    claim = entity.claims[SPOUSE_ID] || [];
  }
  entity.rightIds = claim
    .sort((a, b) => {
      try {
        return a.qualifiers[START_DATE_ID][0].datavalue.value.time <
          b.qualifiers[START_DATE_ID][0].datavalue.value.time
          ? 1
          : -1;
      } catch (error) {
        return 1;
      }
    })
    .map(({ mainsnak }) => {
      try {
        return mainsnak.datavalue.value.id; //for 'No value' and 'Unknown'
      } catch (error) {
        return null;
      }
    })
    .filter((id, index, ids) => {
      // Filter out 'No value' and 'Unknown'
      // Filter people married twice with same person (e.g. elon musk)
      return id && ids.indexOf(id) === index;
    });
}
