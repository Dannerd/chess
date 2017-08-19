<?php
/**
 * Created by PhpStorm.
 * User: Daniel
 * Date: 28/12/2016
 * Time: 12:05 PM
 */

$games_dir = "../games/";

if(isset($_POST['savegamedata'])){
    $game_id = $_POST['game_id'];
    $game_data = $_POST['game_data'];
    $myfile = fopen($games_dir."current/".base64_encode($game_id).".txt", "w") or die("Unable to open file!");
    fwrite($myfile, $game_data);
    fclose($myfile);
    die(true);
}



if(isset($_POST['currentgames'])){
    $games = array();
    foreach(glob($games_dir."current/*") as $game_id){
        $games[] = str_replace(".txt", "", basename($game_id));
    }

    die(json_encode($games));
}


if(isset($_POST['getgamedata'])){
    $game_id = $_POST['game_id'];
    $game_file = $games_dir."current/".base64_encode($game_id).".txt";
    $game_data = file_get_contents($game_file);

    die($game_data);
}


if(isset($_POST['connecttogame'])){
    $game_id = $_POST['game_id'];
    $game_file = $games_dir."current/".base64_encode($game_id).".txt";
    $game_data = file_get_contents($game_file);

    die($game_data);
}


?>