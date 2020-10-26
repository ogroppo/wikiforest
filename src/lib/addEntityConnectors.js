import getClaimIds from "./getClaimIds";
import {
  SIBLINGS_ID,
  SPOUSE_ID,
  START_DATE_ID,
  NUMBER_OF_CHILDREN_ID,
} from "../constants/properties";

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
    //use number of children property, use count of children if not available
    entity.childrenCount = entity.simpleClaims[NUMBER_OF_CHILDREN_ID]
      ? entity.simpleClaims[NUMBER_OF_CHILDREN_ID][0].value
      : entity.downIds.length;
  } else {
    delete entity.downIds;
  }

  if (options.addRightIds) addRightIds(entity);
  else {
    delete entity.rightIds;
  }
  if (options.addLeftIds) entity.leftIds = getClaimIds(entity, SIBLINGS_ID);
  else delete entity.leftIds;
}

function addRightIds(entity) {
  const claim = entity.claims[SPOUSE_ID] || []; //cannot use simpleclaims here as only preferred will show up
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
    .filter((id) => id); //filter out 'No value' and 'Unknown'
}
