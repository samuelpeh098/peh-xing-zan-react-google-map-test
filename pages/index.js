import { useState, useMemo, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { useDispatch } from "react-redux";
import { placeSearched } from "../redux/action";
import { useSelector } from "react-redux";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import parse from "autosuggest-highlight/parse";
import { debounce } from "@mui/material/utils";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import HistoryIcon from "@material-ui/icons/History";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";

export default function Places() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}

function Map() {
  const [selected, setSelected] = useState({ lat: 3.1569486, lng: 101.712303 });
  const center = useMemo(() => selected, [selected]);

  return (
    <>
      <div className="places-container">
        <PlacesAutocomplete setSelected={setSelected} />
      </div>

      <GoogleMap
        zoom={10}
        center={center}
        mapContainerClassName="map-container"
      >
        {selected && <Marker position={center} />}
      </GoogleMap>
    </>
  );
}

const PlacesAutocomplete = ({ setSelected }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();
  const dispatch = useDispatch();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const toggleHistory = () => {
    setShowHistoryModal(!showHistoryModal);
  };
  const handleSelect = async (address) => {
    const description = address && address.description;
    setValue(address, false);
    clearSuggestions();
    const results = await getGeocode({ address: description });
    const { lat, lng } = await getLatLng(results[0]);
    setSelected({ lat, lng });

    dispatch(placeSearched(results[0]));
  };

  let history = useSelector((state) => state.historyPlaceSearched);

  return (
    <>
      <Grid container>
        <Grid sm={6}>
          <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
            <Autocomplete
              id="google-map-demo"
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.description
              }
              filterOptions={(x) => x}
              options={data}
              autoComplete
              includeInputInList
              filterSelectedOptions
              value={value}
              noOptionsText="No locations"
              onChange={(event, newValue) => {
                handleSelect(newValue);
              }}
              onInputChange={(event, newInputValue) => {
                setValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search a location" fullWidth />
              )}
              renderOption={(props, option) => {
                const matches =
                  option.structured_formatting.main_text_matched_substrings ||
                  [];

                const parts = parse(
                  option.structured_formatting.main_text,
                  matches.map((match) => [
                    match.offset,
                    match.offset + match.length,
                  ])
                );

                return (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item sx={{ display: "flex", width: 44 }}>
                        <LocationOnIcon sx={{ color: "text.secondary" }} />
                      </Grid>
                      <Grid
                        item
                        sx={{
                          width: "calc(100% - 44px)",
                          wordWrap: "break-word",
                        }}
                      >
                        {parts.map((part, index) => (
                          <Box
                            key={index}
                            component="span"
                            sx={{
                              fontWeight: part.highlight ? "bold" : "regular",
                            }}
                          >
                            {part.text}
                          </Box>
                        ))}
                        <Typography variant="body2" color="text.secondary">
                          {option.structured_formatting.secondary_text}
                        </Typography>
                      </Grid>
                    </Grid>
                  </li>
                );
              }}
            />
          </Box>
        </Grid>
        <Grid sm={6}>
          <Badge badgeContent={history && history.length} color="primary">
            <HistoryIcon
              color="action"
              onClick={() => {
                toggleHistory();
              }}
              fontSize="large"
              style={{ margin: "10px" }}
            />
          </Badge>
          {showHistoryModal ? (
            <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
              <List>
                {history && history.length > 0
                  ? history.map((e) => {
                      return (
                        <>
                          <ListItem disablePadding>
                            <ListItemButton>
                              <ListItemText primary={e.formatted_address} />
                            </ListItemButton>
                          </ListItem>
                          <Divider />
                        </>
                      );
                    })
                  : "No History"}
              </List>
            </Box>
          ) : (
            ""
          )}
        </Grid>
      </Grid>
    </>
  );
};
